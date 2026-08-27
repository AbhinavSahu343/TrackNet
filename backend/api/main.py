from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from backend.services.prediction_service import (
    PredictionService
)


app = FastAPI(
    title="RailConnect API",
    description=(
        "Backend API for RailConnect "
        "network prediction and recommendation"
    ),
    version="1.0.0"
)


prediction_service = PredictionService()


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
        "project": "RailConnect",
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
            prediction_service.process_telemetry(
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
            "Jio": telemetry.jio,
            "Airtel": telemetry.airtel,
            "Vi": telemetry.vi
        }

        predictions = {}

        for network, request in requests.items():

            result = (
                prediction_service.process_telemetry(
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
                "predictions": predictions,
                "message": (
                    "Waiting for 60 seconds of "
                    "telemetry history."
                )
            }

        # All networks ready
        recommendation = (
            prediction_service.recommend(
                predictions
            )
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