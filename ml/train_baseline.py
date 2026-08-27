import os

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import StandardScaler

from sklearn.linear_model import LogisticRegression

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
    "logistic_regression_baseline.joblib"
)


FEATURE_COLUMNS = [

    # Current network conditions
    "signal_strength",
    "latency_ms",
    "packet_loss_percent",
    "download_speed_mbps",
    "upload_speed_mbps",

    # Historical conditions
    "signal_mean_20s",
    "signal_min_20s",
    "signal_max_20s",
    "signal_change_5s",
    "signal_change_20s",

    "latency_mean_20s",
    "latency_max_20s",
    "latency_change_20s",

    "packet_loss_mean_20s",
    "packet_loss_max_20s",

    "speed_mean_20s",

    "download_mean_20s",
    "upload_mean_20s",

    # Train/location
    "latitude",
    "longitude",
    "distance_km",
    "speed_kmph",

    # Carrier
    "network"
]


NUMERIC_FEATURES = [
    feature
    for feature in FEATURE_COLUMNS
    if feature != "network"
]


CATEGORICAL_FEATURES = [
    "network"
]


TARGET = "dropout_next_60s"


def load_data():

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

    return (
        X_train,
        y_train,
        X_validation,
        y_validation
    )


def build_model():

    preprocessor = ColumnTransformer(

        transformers=[

            (
                "numeric",

                StandardScaler(),

                NUMERIC_FEATURES
            ),

            (
                "categorical",

                OneHotEncoder(
                    handle_unknown="ignore"
                ),

                CATEGORICAL_FEATURES
            )
        ]
    )

    model = LogisticRegression(

        max_iter=1000,

        class_weight="balanced",

        random_state=42
    )

    from sklearn.pipeline import Pipeline

    pipeline = Pipeline(

        steps=[

            (
                "preprocessor",
                preprocessor
            ),

            (
                "model",
                model
            )
        ]
    )

    return pipeline


def main():

    (
        X_train,
        y_train,
        X_validation,
        y_validation
    ) = load_data()

    print()

    print(
        f"Training rows: "
        f"{len(X_train):,}"
    )

    print(
        f"Validation rows: "
        f"{len(X_validation):,}"
    )

    print()

    print(
        "Building Logistic Regression..."
    )

    model = build_model()

    print(
        "Training model..."
    )

    model.fit(
        X_train,
        y_train
    )

    print(
        "Training completed."
    )

    print()
    print(
        "Evaluating on validation set..."
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

    joblib.dump(
        model,
        MODEL_PATH
    )

    print()

    print(
        f"Model saved to:"
        f" {MODEL_PATH}"
    )


if __name__ == "__main__":

    main()