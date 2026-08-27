import pandas as pd

from ml.features import add_features


df = pd.read_csv(
    "ml/data/raw/telemetry_raw.csv"
)

df = add_features(df)

print(
    df[
        [
            "timestamp",
            "network",
            "signal_strength",
            "signal_mean_20s",
            "signal_min_20s",
            "signal_change_5s",
            "signal_change_20s",
            "latency_mean_20s",
            "packet_loss_mean_20s",
            "dropout_next_60s"
        ]
    ].head(20).to_string(index=False)
)
