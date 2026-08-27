import os

import joblib
import pandas as pd

from xgboost import XGBClassifier

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    average_precision_score,
    roc_auc_score
)


TRAIN_PATH = "ml/data/processed/train.csv"

VALIDATION_PATH = (
    "ml/data/processed/validation.csv"
)

MODEL_DIR = "ml/models"

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "xgboost_baseline.json"
)


TARGET = "dropout_next_60s"


FEATURE_COLUMNS = [

    # Current telemetry
    "signal_strength",
    "latency_ms",
    "packet_loss_percent",
    "download_speed_mbps",
    "upload_speed_mbps",

    # Historical telemetry
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

    # Position / movement
    "latitude",
    "longitude",
    "distance_km",
    "speed_kmph"
]


def main():

    print("Loading datasets...")

    train_df = pd.read_csv(
        TRAIN_PATH
    )

    validation_df = pd.read_csv(
        VALIDATION_PATH
    )

    X_train = train_df[
        FEATURE_COLUMNS
    ]

    y_train = train_df[
        TARGET
    ]

    X_validation = validation_df[
        FEATURE_COLUMNS
    ]

    y_validation = validation_df[
        TARGET
    ]

    print()

    print(
        f"Training rows: "
        f"{len(X_train):,}"
    )

    print(
        f"Validation rows: "
        f"{len(X_validation):,}"
    )

    # Calculate imbalance ratio.
    negative_count = (
        y_train == 0
    ).sum()

    positive_count = (
        y_train == 1
    ).sum()

    scale_pos_weight = (
        negative_count
        / positive_count
    )

    print()

    print(
        f"Negative examples: "
        f"{negative_count:,}"
    )

    print(
        f"Positive examples: "
        f"{positive_count:,}"
    )

    print(
        f"scale_pos_weight: "
        f"{scale_pos_weight:.2f}"
    )

    model = XGBClassifier(

        n_estimators=300,

        max_depth=6,

        learning_rate=0.08,

        subsample=0.8,

        colsample_bytree=0.8,

        objective="binary:logistic",

        eval_metric="aucpr",

        scale_pos_weight=scale_pos_weight,

        random_state=42,

        n_jobs=-1,

        tree_method="hist"
    )

    print()

    print(
        "Training XGBoost..."
    )

    model.fit(
        X_train,
        y_train,

        eval_set=[
            (
                X_validation,
                y_validation
            )
        ],

        verbose=False
    )

    print(
        "Training completed."
    )

    probabilities = model.predict_proba(
        X_validation
    )[:, 1]

    predictions = (
        probabilities >= 0.5
    ).astype(int)

    print()
    print(
        "Classification Report:"
    )

    print(
        classification_report(
            y_validation,
            predictions,
            digits=4
        )
    )

    print(
        "Confusion Matrix:"
    )

    print(
        confusion_matrix(
            y_validation,
            predictions
        )
    )

    print()

    print(
        f"PR-AUC: "
        f"{average_precision_score(
            y_validation,
            probabilities
        ):.4f}"
    )

    print(
        f"ROC-AUC: "
        f"{roc_auc_score(
            y_validation,
            probabilities
        ):.4f}"
    )

    os.makedirs(
        MODEL_DIR,
        exist_ok=True
    )

    model.save_model(
        MODEL_PATH
    )

    print()

    print(
        f"Model saved to: "
        f"{MODEL_PATH}"
    )


if __name__ == "__main__":
    main()