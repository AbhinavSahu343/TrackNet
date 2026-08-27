import os

import pandas as pd

from xgboost import XGBClassifier


MODEL_PATH = (
    "ml/models/xgboost_baseline.json"
)

DROPOUT_THRESHOLD = 0.80

PREDICTION_HORIZON_SECONDS = 60


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


class MLPredictor:

    def __init__(self):

        if not os.path.exists(MODEL_PATH):

            raise FileNotFoundError(
                f"Model not found: {MODEL_PATH}"
            )

        self.model = XGBClassifier()

        self.model.load_model(
            MODEL_PATH
        )

    def predict(
        self,
        telemetry: dict
    ):

        missing = [
            feature
            for feature in FEATURE_COLUMNS
            if feature not in telemetry
        ]

        if missing:

            raise ValueError(
                f"Missing features: {missing}"
            )

        df = pd.DataFrame(
            [
                telemetry
            ]
        )[
            FEATURE_COLUMNS
        ]

        probability = float(
            self.model.predict_proba(df)[0][1]
        )

        return {

            "dropout_probability": round(
                probability,
                4
            ),

            "dropout_predicted": (
                probability
                >= DROPOUT_THRESHOLD
            ),

            "prediction_horizon_seconds":
                PREDICTION_HORIZON_SECONDS,

            "threshold":
                DROPOUT_THRESHOLD
        }