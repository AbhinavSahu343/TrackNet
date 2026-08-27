from backend.services.feature_service import (
    FeatureEngine
)

from backend.services.ml_service import (
    MLPredictor
)


def run_test(
    name,
    signal_start,
    signal_drop,
    latency_start,
    latency_rise,
    packet_start,
    packet_rise
):

    print()
    print("=" * 60)
    print(name)
    print("=" * 60)

    engine = FeatureEngine()

    predictor = MLPredictor()

    for i in range(12):

        progress = i / 11

        telemetry = {

            "signal_strength":
                signal_start
                - signal_drop * progress,

            "latency_ms":
                latency_start
                + latency_rise * progress,

            "packet_loss_percent":
                packet_start
                + packet_rise * progress,

            "download_speed_mbps":
                70
                - 40 * progress,

            "upload_speed_mbps":
                25
                - 12 * progress,

            "speed_kmph":
                90,

            "latitude":
                26.0,

            "longitude":
                80.0,

            "distance_km":
                700
                + i * 0.125
        }

        features = engine.update(
            "Jio",
            telemetry
        )

    print()

    print(
        "Feature engine ready:",
        engine.is_ready("Jio")
    )

    result = predictor.predict(
        features
    )

    print()

    for key, value in result.items():

        print(
            f"{key}: {value}"
        )


run_test(

    name="HEALTHY NETWORK",

    signal_start=75,
    signal_drop=5,

    latency_start=35,
    latency_rise=5,

    packet_start=0.5,
    packet_rise=0.5
)


run_test(

    name="SEVERE DETERIORATION",

    signal_start=65,
    signal_drop=40,

    latency_start=45,
    latency_rise=100,

    packet_start=1.0,
    packet_rise=7.0
)