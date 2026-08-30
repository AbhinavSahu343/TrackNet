from backend.simulation.train import TrainSimulator
from backend.simulation.network import (
    generate_network_telemetry
)

from backend.services.feature_service import (
    FeatureEngine
)

from backend.services.ml_service import (
    MLPredictor
)

from backend.services.recommendation_service import (
    RecommendationService
)


def main():

    train = TrainSimulator(
        speed_kmph=90.0
    )

    feature_engines = {
        "Jio": FeatureEngine(),
        "Airtel": FeatureEngine(),
        "Vi": FeatureEngine()
    }

    predictor = MLPredictor()

    recommender = RecommendationService()

    previous_state = None

    train_state = train.reset()

    print(
        "Starting TrackNet live recommendation test..."
    )

    print()

    for step in range(12000):

        if train_state["finished"]:
            break

        distance_km = train_state[
            "distance_km"
        ]

        # --------------------------------------------
        # Generate network telemetry
        # --------------------------------------------

        network_data = generate_network_telemetry(
            distance_km,
            previous_state
        )

        previous_state = {
            network: data["signal_strength"]
            for network, data
            in network_data.items()
        }

        predictions = {}

        # --------------------------------------------
        # Predict each carrier
        # --------------------------------------------

        for network, data in network_data.items():

            telemetry = {

                **data,

                "speed_kmph":
                    train_state["speed_kmph"],

                "latitude":
                    train_state["latitude"],

                "longitude":
                    train_state["longitude"],

                "distance_km":
                    distance_km
            }

            engine = feature_engines[
                network
            ]

            features = engine.update(
                network,
                telemetry
            )

            if not engine.is_ready(network):
                continue

            result = predictor.predict(
                features
            )

            predictions[network] = result

        # --------------------------------------------
        # Recommend carrier once all engines are ready
        # --------------------------------------------

        if len(predictions) == 3:

            recommendation = (
                recommender.recommend(
                    predictions
                )
            )

            # Print every 100 steps initially
            if step % 100 == 0:

                print(
                    f"Step {step:04d} | "
                    f"Distance: "
                    f"{distance_km:.3f} km"
                )

                for network, result in predictions.items():

                    print(
                        f"  {network:6s}: "
                        f"{result['dropout_probability']:.4f}"
                    )

                print(
                    f"  → Recommended: "
                    f"{recommendation['recommended_network']} "
                    f"({recommendation['status']})"
                )
                print(
                    f"  → Reason: "
                    f"{recommendation['reason']}"
                )

                print()

        # --------------------------------------------
        # Move train
        # --------------------------------------------

        train_state = train.move(
            seconds=5
        )

    print(
        "Live recommendation test completed."
    )


if __name__ == "__main__":
    main()