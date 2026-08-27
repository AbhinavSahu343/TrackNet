from backend.services.feature_service import FeatureEngine
from backend.services.ml_service import MLPredictor
from backend.services.recommendation_service import (
    RecommendationService
)


class PredictionService:

    NETWORKS = [
        "Jio",
        "Airtel",
        "Vi"
    ]

    def __init__(self):

        self.feature_engines = {
            network: FeatureEngine()
            for network in self.NETWORKS
        }

        self.predictor = MLPredictor()

        self.recommender = (
            RecommendationService()
        )

    def process_telemetry(
        self,
        network: str,
        telemetry: dict
    ):

        if network not in self.NETWORKS:

            raise ValueError(
                f"Unsupported network: {network}"
            )

        engine = self.feature_engines[
            network
        ]

        features = engine.update(
            network,
            telemetry
        )

        if not engine.is_ready(network):

            return {
                "network": network,
                "ready": False,
                "prediction": None
            }

        prediction = self.predictor.predict(
            features
        )

        return {
            "network": network,
            "ready": True,
            "prediction": prediction
        }

    def recommend(
        self,
        predictions: dict
    ):

        return self.recommender.recommend(
            predictions
        )