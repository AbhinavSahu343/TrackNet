from backend.simulation.telemetry import (
    TelemetryGenerator
)

from backend.services.prediction_service import (
    PredictionService
)


class SimulationService:

    NETWORKS = [
        "Jio",
        "Airtel",
        "Vi"
    ]

    def __init__(
        self,
        interval_seconds=5,
        movement_multiplier=1.0
    ):

        self.interval_seconds = (
            interval_seconds
        )

        self.movement_multiplier = (
            movement_multiplier
        )

        self.generator = TelemetryGenerator(
            interval_seconds=interval_seconds,
            movement_multiplier=movement_multiplier
        )

        self.prediction_service = (
            PredictionService()
        )

        self.current_telemetry = None

        self.current_predictions = {}

        self.current_recommendation = {

            "recommended_network": None,

            "status": "NO_DATA",

            "reason": (
                "Waiting for telemetry history."
            ),

            "networks": {}
        }

        self.step_count = 0

    def step(self):

        # --------------------------------------------------
        # Generate next telemetry observation
        # --------------------------------------------------

        if self.step_count == 0:

            telemetry = (
                self.generator
                .generate_current_telemetry()
            )

        else:

            telemetry = (
                self.generator
                .move_and_generate()
            )

        self.step_count += 1

        self.current_telemetry = telemetry

        predictions = {}

        # --------------------------------------------------
        # Run ML prediction for every network
        # --------------------------------------------------

        for network in self.NETWORKS:

            metrics = telemetry[
                "networks"
            ][network]

            network_telemetry = {

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

                "speed_kmph":
                    telemetry["speed_kmph"],

                "latitude":
                    telemetry["latitude"],

                "longitude":
                    telemetry["longitude"],

                "distance_km":
                    telemetry["distance_km"]
            }

            result = (
                self.prediction_service
                .process_telemetry(
                    network,
                    network_telemetry
                )
            )

            if result["ready"]:

                predictions[network] = (
                    result["prediction"]
                )

        self.current_predictions = predictions

        # --------------------------------------------------
        # Generate recommendation
        # --------------------------------------------------

        if len(predictions) == len(
            self.NETWORKS
        ):

            self.current_recommendation = (
                self.prediction_service
                .recommend(predictions)
            )

        else:

            self.current_recommendation = {

                "recommended_network": None,

                "status": "WARMING_UP",

                "reason": (
                    "Collecting telemetry "
                    "history before prediction."
                ),

                "networks": {}
            }

        return self.get_current_state()

    def get_current_state(self):

        return {

            "step":
                self.step_count,

            "telemetry":
                self.current_telemetry,

            "predictions":
                self.current_predictions,

            "recommendation":
                self.current_recommendation
        }

    def reset(self):

        self.generator = TelemetryGenerator(
            interval_seconds=self.interval_seconds,
            movement_multiplier=self.movement_multiplier
        )

        self.prediction_service = (
            PredictionService()
        )

        self.current_telemetry = None

        self.current_predictions = {}

        self.current_recommendation = {

            "recommended_network": None,

            "status": "NO_DATA",

            "reason": (
                "Waiting for telemetry history."
            ),

            "networks": {}
        }

        self.step_count = 0