import os
import asyncio

from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    HTTPException
)

from pydantic import BaseModel

from backend.services.prediction_service import (
    PredictionService
)

from backend.services.simulation_service import (
    SimulationService
)


# ============================================================
# CONFIGURATION
# ============================================================

simulation_interval = float(
    os.getenv(
        "TRACKNET_SIMULATION_INTERVAL",
        "5"
    )
)

movement_multiplier = float(
    os.getenv(
        "TRACKNET_MOVEMENT_MULTIPLIER",
        "1"
    )
)


# ============================================================
# SERVICES
# ============================================================

prediction_service = PredictionService()

simulation_service = SimulationService(
    interval_seconds=simulation_interval,
    movement_multiplier=movement_multiplier
)


# ============================================================
# BACKGROUND SIMULATION
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    async def simulation_loop():

        while True:

            try:

                simulation_service.step()

            except Exception as e:

                print(
                    "Simulation error:",
                    e
                )

            await asyncio.sleep(
                simulation_interval
            )

    task = asyncio.create_task(
        simulation_loop()
    )

    try:

        yield

    finally:

        task.cancel()

        try:

            await task

        except asyncio.CancelledError:

            pass


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="TrackNet API",
    description=(
        "Backend API for TrackNet "
        "network prediction and recommendation"
    ),
    version="1.0.0",
    lifespan=lifespan
)


# ============================================================
# REQUEST MODELS
# ============================================================

class TelemetryRequest(BaseModel):

    network: str

    signal_strength: float

    latency_ms: float

    packet_loss_percent: float

    download_speed_mbps: float

    upload_speed_mbps: float

    speed_kmph: float

    latitude: float

    longitude: float

    distance_km: float


class MultiNetworkTelemetryRequest(BaseModel):

    jio: TelemetryRequest

    airtel: TelemetryRequest

    vi: TelemetryRequest


# ============================================================
# BASIC ENDPOINTS
# ============================================================

@app.get("/")
def root():

    return {
        "project": "TrackNet",
        "status": "running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ============================================================
# SINGLE NETWORK PREDICTION
# ============================================================

@app.post("/predict")
def predict(
    telemetry: TelemetryRequest
):

    try:

        result = (
            prediction_service
            .process_telemetry(
                telemetry.network,
                telemetry.model_dump(
                    exclude={"network"}
                )
            )
        )

        return result

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# MULTI-NETWORK RECOMMENDATION
# ============================================================

@app.post("/recommend")
def recommend(
    telemetry: MultiNetworkTelemetryRequest
):

    try:

        requests = {

            "Jio":
                telemetry.jio,

            "Airtel":
                telemetry.airtel,

            "Vi":
                telemetry.vi
        }

        predictions = {}

        for network, request in requests.items():

            result = (
                prediction_service
                .process_telemetry(
                    network,
                    request.model_dump(
                        exclude={"network"}
                    )
                )
            )

            if result["ready"]:

                predictions[network] = (
                    result["prediction"]
                )

        # Not enough history yet
        if len(predictions) < 3:

            return {

                "ready": False,

                "predictions":
                    predictions,

                "message": (
                    "Waiting for 60 seconds "
                    "of telemetry history."
                )
            }

        # All networks ready
        recommendation = (
            prediction_service
            .recommend(predictions)
        )

        return {

            "ready": True,

            **recommendation
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


# ============================================================
# LIVE SIMULATION
# ============================================================

@app.get("/live")
def live():

    state = (
        simulation_service
        .get_current_state()
    )

    telemetry = state["telemetry"]

    if telemetry is None:

        return {

            "ready": False,

            "message": (
                "Simulation has not started yet."
            )
        }

    networks = {}

    for network, metrics in (
        telemetry["networks"].items()
    ):

        prediction = (
            state["predictions"]
            .get(network)
        )

        networks[network] = {

            "signal_strength":
                metrics["signal_strength"],

            "latency_ms":
                metrics["latency_ms"],

            "packet_loss_percent":
                metrics[
                    "packet_loss_percent"
                ],

            "download_speed_mbps":
                metrics[
                    "download_speed_mbps"
                ],

            "upload_speed_mbps":
                metrics[
                    "upload_speed_mbps"
                ],

            "dropout_probability":
                (
                    prediction[
                        "dropout_probability"
                    ]
                    if prediction
                    else None
                ),

            "dropout_predicted":
                (
                    prediction[
                        "dropout_predicted"
                    ]
                    if prediction
                    else None
                )
        }

    recommendation = (
        state["recommendation"]
    )

    return {

        "ready": (
            recommendation["status"]
            != "WARMING_UP"
        ),

        "step":
            state["step"],

        "timestamp":
            telemetry["timestamp"],

        "train": {

            "route":
                telemetry["route"],

            "location":
                telemetry["location"],

            "latitude":
                telemetry["latitude"],

            "longitude":
                telemetry["longitude"],

            "distance_km":
                telemetry["distance_km"],

            "speed_kmph":
                telemetry["speed_kmph"]
        },

        "networks":
            networks,

        "recommendation": {

            "recommended_network":
                recommendation[
                    "recommended_network"
                ],

            "dropout_probability":
                recommendation.get(
                    "dropout_probability"
                ),

            "status":
                recommendation["status"],

            "reason":
                recommendation["reason"],

            "threshold":
                recommendation.get(
                    "threshold"
                )
        }
    }


# ============================================================
# SIMULATION CONTROL — DEVELOPMENT
# ============================================================

@app.post("/simulation/step")
def simulation_step():

    return simulation_service.step()