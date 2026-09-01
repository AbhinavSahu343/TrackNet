from backend.simulation.network import (
    generate_network_telemetry
)

from backend.services.prediction_service import (
    PredictionService
)


NETWORKS = [
    "Jio",
    "Airtel",
    "Vi"
]


def build_telemetry(
    distance,
    network_data
):
    """
    Convert simulated network telemetry
    into the format expected by
    PredictionService.
    """

    return {
        "signal_strength":
            network_data["signal_strength"],

        "latency_ms":
            network_data["latency_ms"],

        "packet_loss_percent":
            network_data[
                "packet_loss_percent"
            ],

        "download_speed_mbps":
            network_data[
                "download_speed_mbps"
            ],

        "upload_speed_mbps":
            network_data[
                "upload_speed_mbps"
            ],

        "speed_kmph": 90,

        "latitude": 24.0,

        "longitude": 75.0,

        "distance_km": distance
    }


def main():

    print()
    print(
        "Testing TrackNet dropout zone..."
    )
    print()

    prediction_service = (
        PredictionService()
    )

    previous_state = {}

    # --------------------------------------------------
    # Current active network
    #
    # TrackNet starts the journey on Jio.
    # --------------------------------------------------

    current_network = "Jio"

    # --------------------------------------------------
    # Warm up ML feature history
    # --------------------------------------------------

    print(
        "Warming up ML feature history..."
    )

    for step in range(12):

        distance = (
            650
            + step * 3
        )

        network_data = (
            generate_network_telemetry(
                distance,
                previous_state
            )
        )

        previous_state = {

            network:
                metrics["signal_strength"]

            for network, metrics
            in network_data.items()
        }

        for network in NETWORKS:

            telemetry = build_telemetry(
                distance,
                network_data[network]
            )

            prediction_service.process_telemetry(
                network,
                telemetry
            )

    print(
        "Feature history ready."
    )

    print()

    print(
        f"Starting network: {current_network}"
    )

    print()

    print(
        "Testing failure region..."
    )

    print()

    # --------------------------------------------------
    # Jio failure zone
    # --------------------------------------------------

    test_distances = [
        680,
        690,
        700,
        710,
        712.5,
        720,
        730,
        735,
        740,
        750
    ]

    for distance in test_distances:

        # --------------------------------------------------
        # Generate network telemetry
        # --------------------------------------------------

        network_data = (
            generate_network_telemetry(
                distance,
                previous_state
            )
        )

        previous_state = {

            network:
                metrics["signal_strength"]

            for network, metrics
            in network_data.items()
        }

        predictions = {}

        # --------------------------------------------------
        # Generate ML prediction for every network
        # --------------------------------------------------

        for network in NETWORKS:

            telemetry = build_telemetry(
                distance,
                network_data[network]
            )

            result = (
                prediction_service
                .process_telemetry(
                    network,
                    telemetry
                )
            )

            if result["ready"]:

                predictions[network] = (
                    result["prediction"]
                )

        # --------------------------------------------------
        # Distance
        # --------------------------------------------------

        print(
            f"DISTANCE {distance:7.1f} km"
        )

        # --------------------------------------------------
        # Display network risks
        # --------------------------------------------------

        for network in NETWORKS:

            if network not in predictions:

                print(
                    f"  {network:<7}: "
                    "warming up"
                )

                continue

            probability = (
                predictions[
                    network
                ][
                    "dropout_probability"
                ]
            )

            marker = ""

            if network == current_network:

                marker = "  <-- CURRENT"

            print(
                f"  {network:<7}: "
                f"{probability:.4f}"
                f"{marker}"
            )

        # --------------------------------------------------
        # Generate recommendation
        # --------------------------------------------------

        if len(predictions) == 3:

            recommendation = (
                prediction_service
                .recommend(
                    predictions,
                    current_network
                )
            )

            recommended_network = (
                recommendation[
                    "recommended_network"
                ]
            )

            status = (
                recommendation[
                    "status"
                ]
            )

            # --------------------------------------------------
            # Store the network and risk BEFORE switching.
            # --------------------------------------------------

            previous_network = (
                current_network
            )

            previous_risk = (
                predictions[
                    previous_network
                ][
                    "dropout_probability"
                ]
            )

            # --------------------------------------------------
            # SWITCH REQUIRED
            # --------------------------------------------------

            if (
                status == "SWITCH_REQUIRED"
                and
                recommended_network
                and
                recommended_network
                != current_network
            ):

                new_network_risk = (
                    predictions[
                        recommended_network
                    ][
                        "dropout_probability"
                    ]
                )

                print()

                print(
                    f"  ⚠ SWITCHING: "
                    f"{previous_network} "
                    f"→ "
                    f"{recommended_network}"
                )

                print(
                    f"  ⚠ {previous_network} risk: "
                    f"{previous_risk:.2%}"
                )

                print(
                    f"  ✓ {recommended_network} risk: "
                    f"{new_network_risk:.2%}"
                )

                # ----------------------------------------------
                # Update currently active network
                # ----------------------------------------------

                current_network = (
                    recommended_network
                )

                print(
                    f"  ✓ Connected to: "
                    f"{current_network}"
                )

                print(
                    "  → Status: "
                    "SWITCH_REQUIRED"
                )

            # --------------------------------------------------
            # NO SWITCH
            # --------------------------------------------------

            else:

                current_risk = (
                    predictions[
                        current_network
                    ][
                        "dropout_probability"
                    ]
                )

                print()

                print(
                    f"  → Current Network: "
                    f"{current_network}"
                )

                print(
                    f"  → Current Risk: "
                    f"{current_risk:.2%}"
                )

                print(
                    f"  → Recommended: "
                    f"{recommended_network}"
                )

                print(
                    f"  → Status: "
                    f"{status}"
                )

        print()


if __name__ == "__main__":

    main()