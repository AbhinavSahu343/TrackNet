from backend.services.simulation_service import (
    SimulationService
)


class DashboardService:

    def __init__(self, simulation_service: SimulationService):

        self.simulation = simulation_service

    def get_dashboard(self):

        state = self.simulation.get_current_state()

        telemetry = state["telemetry"]

        recommendation = state["recommendation"]

        if telemetry is None:

            return {
                "ready": False,
                "message": "Simulation not started."
            }

        alerts = []

        predictions = state["predictions"]

        for network, prediction in predictions.items():

            probability = prediction["dropout_probability"]

            if probability >= 0.8:

                alerts.append({
                    "severity": "HIGH",
                    "network": network,
                    "message": (
                        f"{network} predicted to lose connectivity within 60 seconds."
                    )
                })

            elif probability >= 0.5:

                alerts.append({
                    "severity": "MEDIUM",
                    "network": network,
                    "message": (
                        f"{network} connectivity is deteriorating."
                    )
                })

        return {
            "ready": recommendation["status"] != "WARMING_UP",

            "system_status": recommendation["status"],

            "train": {
                "route": telemetry["route"],
                "location": telemetry["location"],
                "distance_km": telemetry["distance_km"],
                "speed_kmph": telemetry["speed_kmph"],
                "latitude": telemetry["latitude"],
                "longitude": telemetry["longitude"]
            },

            "recommendation": recommendation,

            "networks": telemetry["networks"],

            "predictions": predictions,

            "alerts": alerts
        }