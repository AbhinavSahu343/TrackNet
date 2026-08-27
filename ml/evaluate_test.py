import pandas as pd

from xgboost import XGBClassifier

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    average_precision_score,
    roc_auc_score
)


TEST_PATH = (
    "ml/data/processed/test.csv"
)

MODEL_PATH = (
    "ml/models/xgboost_baseline.json"
)

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


THRESHOLD = 0.80


def main():

    print("Loading test dataset...")

    test_df = pd.read_csv(
        TEST_PATH
    )

    X_test = test_df[
        FEATURE_COLUMNS
    ]

    y_test = test_df[
        TARGET
    ]

    print(
        f"Test rows: {len(test_df):,}"
    )

    print(
        f"Test journeys: "
        f"{test_df.journey_id.nunique()}"
    )

    print()

    model = XGBClassifier()

    model.load_model(
        MODEL_PATH
    )

    print(
        "Generating test predictions..."
    )

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    predictions = (
        probabilities >= THRESHOLD
    ).astype(int)

    print()
    print(
        "=" * 60
    )

    print(
        "FINAL TEST RESULTS"
    )

    print(
        "=" * 60
    )

    print()

    print(
        classification_report(
            y_test,
            predictions,
            digits=4
        )
    )

    print(
        "Confusion Matrix:"
    )

    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )

    print()

    print(
        f"Threshold: {THRESHOLD}"
    )

    print(
        f"PR-AUC: "
        f"{average_precision_score(
            y_test,
            probabilities
        ):.4f}"
    )

    print(
        f"ROC-AUC: "
        f"{roc_auc_score(
            y_test,
            probabilities
        ):.4f}"
    )


if __name__ == "__main__":

    main()