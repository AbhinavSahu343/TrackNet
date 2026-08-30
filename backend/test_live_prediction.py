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

    previous_state = None

    print(
        "Starting TrackNet live ML test..."
    )

    print()

    # ------------------------------------------------
    # Start from the beginning of the route
    # ------------------------------------------------

    train_state = train.reset()

    # ------------------------------------------------
    # Simulate the journey
    #
    # 5 seconds per observation
    # ------------------------------------------------

    for step in range(12000):

        if train_state["finished"]:

            break

        distance_km = train_state[
            "distance_km"
        ]

        # --------------------------------------------
        # Generate network telemetry
        # --------------------------------------------

        network_data = (
            generate_network_telemetry(
                distance_km,
                previous_state
            )
        )

        # --------------------------------------------
        # Save previous network signal state
        # --------------------------------------------

        previous_state = {

            network: data[
                "signal_strength"
            ]

            for network, data
            in network_data.items()
        }

        # --------------------------------------------
        # Process each carrier separately
        # --------------------------------------------

        for network, data in network_data.items():

            telemetry = {

                **data,

                "speed_kmph":
                    train_state[
                        "speed_kmph"
                    ],

                "latitude":
                    train_state[
                        "latitude"
                    ],

                "longitude":
                    train_state[
                        "longitude"
                    ],

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

            # ----------------------------------------
            # Need 60 seconds of history
            # ----------------------------------------

            if not engine.is_ready(
                network
            ):

                continue

            result = predictor.predict(
                features
            )

            probability = result[
                "dropout_probability"
            ]

            # ----------------------------------------
            # Print high-risk predictions
            # ----------------------------------------

            if probability >= 0.80:

                print(
                    f"Step {step:04d} | "
                    f"{network:6s} | "
                    f"distance="
                    f"{distance_km:.3f} km | "
                    f"signal="
                    f"{data['signal_strength']:.2f} | "
                    f"latency="
                    f"{data['latency_ms']:.2f} | "
                    f"loss="
                    f"{data['packet_loss_percent']:.2f} | "
                    f"probability="
                    f"{probability:.4f}"
                )

        # --------------------------------------------
        # Move train forward by 5 seconds
        # --------------------------------------------

        train_state = train.move(
            seconds=5
        )

    print()

    print(
        "Live ML test completed."
    )

    print(
        f"Final distance: "
        f"{train_state['distance_km']:.3f} km"
    )


if __name__ == "__main__":

    main()