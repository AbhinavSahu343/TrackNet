import os

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

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


BASE_FEATURES = [

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
    "speed_kmph",

    "network"
]


TARGET = "dropout_next_60s"


def train_and_evaluate(
    train_df,
    validation_df,
    feature_columns,
    name
):

    print()
    print("=" * 60)
    print(name)
    print("=" * 60)

    numeric_features = [
        feature
        for feature in feature_columns
        if feature != "network"
    ]

    categorical_features = [
        "network"
    ]

    X_train = train_df[
        feature_columns
    ]

    y_train = train_df[
        TARGET
    ]

    X_validation = validation_df[
        feature_columns
    ]

    y_validation = validation_df[
        TARGET
    ]

    preprocessor = ColumnTransformer(

        transformers=[

            (
                "numeric",

                StandardScaler(),

                numeric_features
            ),

            (
                "categorical",

                OneHotEncoder(
                    handle_unknown="ignore"
                ),

                categorical_features
            )
        ]
    )

    model = Pipeline(

        steps=[

            (
                "preprocessor",
                preprocessor
            ),

            (
                "model",

                LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",
                    random_state=42
                )
            )
        ]
    )

    print("Training...")

    model.fit(
        X_train,
        y_train
    )

    probabilities = model.predict_proba(
        X_validation
    )[:, 1]

    predictions = (
        probabilities >= 0.5
    ).astype(int)

    print()

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

    return model


def main():

    print("Loading data...")

    train_df = pd.read_csv(
        TRAIN_PATH
    )

    validation_df = pd.read_csv(
        VALIDATION_PATH
    )

    # ----------------------------------
    # A: Full feature set
    # ----------------------------------

    train_and_evaluate(
        train_df,
        validation_df,
        BASE_FEATURES,
        "A: Full feature set"
    )

    # ----------------------------------
    # B: Remove GPS/location
    # ----------------------------------

    no_gps = [
        feature
        for feature in BASE_FEATURES
        if feature not in [
            "latitude",
            "longitude",
            "distance_km"
        ]
    ]

    train_and_evaluate(
        train_df,
        validation_df,
        no_gps,
        "B: No GPS/location"
    )

    # ----------------------------------
    # C: Current metrics only
    # ----------------------------------

    current_only = [

        "signal_strength",
        "latency_ms",
        "packet_loss_percent",
        "download_speed_mbps",
        "upload_speed_mbps",

        "latitude",
        "longitude",
        "distance_km",
        "speed_kmph",

        "network"
    ]

    train_and_evaluate(
        train_df,
        validation_df,
        current_only,
        "C: Current metrics + GPS"
    )

    # ----------------------------------
    # D: Current + historical metrics,
    #    but no GPS
    # ----------------------------------

    history_no_gps = [

        "signal_strength",
        "latency_ms",
        "packet_loss_percent",
        "download_speed_mbps",
        "upload_speed_mbps",

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

        "speed_kmph",

        "network"
    ]

    train_and_evaluate(
        train_df,
        validation_df,
        history_no_gps,
        "D: Current + history, no GPS"
    )

        # ----------------------------------
    # E: Current network metrics only
    # ----------------------------------

    current_network_only = [

        "signal_strength",
        "latency_ms",
        "packet_loss_percent",
        "download_speed_mbps",
        "upload_speed_mbps",

        "network"
    ]

    train_and_evaluate(
        train_df,
        validation_df,
        current_network_only,
        "E: Current network metrics only"
    )

    # ----------------------------------
    # F: Historical metrics only
    # ----------------------------------

    history_only = [

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

        "network"
    ]

    train_and_evaluate(
        train_df,
        validation_df,
        history_only,
        "F: Historical metrics only"
    )


if __name__ == "__main__":
    main()