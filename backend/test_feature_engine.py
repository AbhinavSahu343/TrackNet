from backend.services.feature_service import (
    FeatureEngine
)


engine = FeatureEngine()


for i in range(12):

    telemetry = {

        "signal_strength":
            70 - i * 2,

        "latency_ms":
            40 + i * 3,

        "packet_loss_percent":
            1 + i * 0.2,

        "download_speed_mbps":
            60 - i,

        "upload_speed_mbps":
            20 - i * 0.3,

        "speed_kmph":
            90,

        "latitude":
            26.0,

        "longitude":
            80.0,

        "distance_km":
            700 + i * 0.125,

        "speed_kmph":
            90
    }

    features = engine.update(
        "Jio",
        telemetry
    )


print(
    "Generated features:"
)

for key, value in features.items():

    print(
        f"{key}: {value}"
    )