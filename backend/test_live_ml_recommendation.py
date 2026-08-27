from backend.simulation.telemetry import (
    TelemetryGenerator
)

from backend.services.prediction_service import (
    PredictionService
)


NETWORKS = ["Jio", "Airtel", "Vi"]


def main():

    print(
        "Starting RailConnect live ML recommendation..."
    )

    print()

    generator = TelemetryGenerator(
        interval_seconds=5
    )

    prediction_service = PredictionService()

    # --------------------------------------------------
    # Run simulation
    # --------------------------------------------------

    for step in range(6000):

        if step == 0:

            telemetry = (
                generator.generate_current_telemetry()
            )

        else:

            telemetry = (
                generator.move_and_generate()
            )

        predictions = {}

        # --------------------------------------------------
        # Process each network
        # --------------------------------------------------

        for network in NETWORKS:

            metrics = telemetry["networks"][network]

            network_telemetry = {

                "signal_strength":
                    metrics["signal_strength"],

                "latency_ms":
                    metrics["latency_ms"],

                "packet_loss_percent":
                    metrics["packet_loss_percent"],

                "download_speed_mbps":
                    metrics["download_speed_mbps"],

                "upload_speed_mbps":
                    metrics["upload_speed_mbps"],

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
                prediction_service.process_telemetry(
                    network,
                    network_telemetry
                )
            )

            if result["ready"]:

                predictions[network] = (
                    result["prediction"]
                )

        # --------------------------------------------------
        # Recommendation
        # --------------------------------------------------

        if len(predictions) == 3:

            recommendation = (
                prediction_service.recommend(
                    predictions
                )
            )

            if step % 100 == 0:

                print(
                    f"STEP {step:04d} | "
                    f"Distance: "
                    f"{telemetry['distance_km']:.3f} km"
                )

                for network in NETWORKS:

                    probability = (
                        predictions[network]
                        ["dropout_probability"]
                    )

                    print(
                        f"  {network:<6}: "
                        f"{probability:.4f}"
                    )

                print(
                    f"  → Recommended: "
                    f"{recommendation['recommended_network']}"
                )

                print(
                    f"  → Status: "
                    f"{recommendation['status']}"
                )

                print()

        else:

            if step % 10 == 0:

                print(
                    f"STEP {step:04d} | "
                    f"Building history..."
                )


if __name__ == "__main__":

    main()