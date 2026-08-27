import pandas as pd

from xgboost import XGBClassifier


TEST_PATH = "ml/data/processed/test.csv"

MODEL_PATH = "ml/models/xgboost_baseline.json"

TARGET = "dropout_next_60s"


FEATURE_COLUMNS = [

    "signal_strength",
    "latency_ms",
    "packet_loss_percent",
    "download_speed_mbps",
    "upload_speed_mbps",

    "signal_change_5s",
    "signal_change_20s",
    "signal_change_40s",
    "signal_change_60s",

    "signal_mean_20s",
    "signal_mean_40s",
    "signal_mean_60s",

    "signal_min_20s",
    "signal_min_60s",

    "signal_max_20s",

    "latency_change_20s",
    "latency_change_40s",
    "latency_change_60s",

    "latency_mean_20s",
    "latency_mean_60s",

    "latency_max_20s",
    "latency_max_60s",

    "packet_loss_mean_20s",
    "packet_loss_mean_60s",

    "packet_loss_max_20s",
    "packet_loss_max_60s",

    "speed_mean_20s",

    "download_mean_20s",
    "download_mean_60s",

    "upload_mean_20s",
    "upload_mean_60s",

    "latitude",
    "longitude",
    "distance_km",
    "speed_kmph"
]


def main():

    df = pd.read_csv(TEST_PATH)

    model = XGBClassifier()

    model.load_model(
        MODEL_PATH
    )

    # Pick actual positive examples
    positives = df[
        df[TARGET] == 1
    ].head(10)

    X = positives[
        FEATURE_COLUMNS
    ]

    probabilities = model.predict_proba(
        X
    )[:, 1]

    print(
        "REAL TEST ROWS"
    )

    print("=" * 60)

    for i, probability in enumerate(
        probabilities
    ):

        row = positives.iloc[i]

        print()

        print(
            f"Row {i + 1}"
        )

        print(
            f"Network: "
            f"{row.get('network', 'N/A')}"
        )

        print(
            f"Distance: "
            f"{row['distance_km']}"
        )

        print(
            f"Signal: "
            f"{row['signal_strength']}"
        )

        print(
            f"Latency: "
            f"{row['latency_ms']}"
        )

        print(
            f"Packet loss: "
            f"{row['packet_loss_percent']}"
        )

        print(
            f"Actual label: "
            f"{row[TARGET]}"
        )

        print(
            f"Probability: "
            f"{probability:.4f}"
        )


if __name__ == "__main__":
    main()