import os

import pandas as pd

from ml.features import add_features


INPUT_PATH = "ml/data/raw/telemetry_raw.csv"

OUTPUT_DIR = "ml/data/processed"

OUTPUT_PATH = os.path.join(
    OUTPUT_DIR,
    "telemetry_features.csv"
)


def main():

    print("Loading raw telemetry...")

    df = pd.read_csv(INPUT_PATH)

    print(f"Raw rows: {len(df):,}")

    print("Creating features...")

    df = add_features(df)

    # Remove rows where we don't have enough
    # historical information.
    #
    # Our history window is 20 seconds,
    # represented by 4 observations.
    df = df.dropna(
        subset=[
            "signal_change_60s",
            "latency_change_60s"
        ]
    )

    # We don't need the raw timestamp as a numerical
    # feature for our first model.
    #
    # Keep it in the dataset for debugging.
    
    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print()
    print("Processed dataset created.")
    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")
    print(f"Saved: {OUTPUT_PATH}")

    print()
    print("Target distribution:")

    print(
        df[
            "dropout_next_60s"
        ].value_counts()
    )


if __name__ == "__main__":
    main()