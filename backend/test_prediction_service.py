from backend.services.prediction_service import (
    PredictionService
)


def main():

    service = PredictionService()

    telemetry = {

        "signal_strength": 60,

        "latency_ms": 40,

        "packet_loss_percent": 1.0,

        "download_speed_mbps": 60,

        "upload_speed_mbps": 20,

        "speed_kmph": 90,

        "latitude": 25.0,

        "longitude": 77.0,

        "distance_km": 650
    }

    print(
        "Testing PredictionService..."
    )

    print()

    for i in range(12):

        result = service.process_telemetry(
            "Jio",
            telemetry
        )

        print(
            f"Observation {i + 1}: "
            f"{result}"
        )

    print()

    print(
        "PredictionService test completed."
    )


if __name__ == "__main__":

    main()