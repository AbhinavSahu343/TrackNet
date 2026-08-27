import os

import pandas as pd


INPUT_PATH = "ml/data/processed/telemetry_features.csv"

OUTPUT_DIR = "ml/data/processed"

TRAIN_PATH = os.path.join(
    OUTPUT_DIR,
    "train.csv"
)

VALIDATION_PATH = os.path.join(
    OUTPUT_DIR,
    "validation.csv"
)

TEST_PATH = os.path.join(
    OUTPUT_DIR,
    "test.csv"
)


def main():

    print("Loading processed dataset...")

    df = pd.read_csv(INPUT_PATH)

    journeys = sorted(
        df["journey_id"].unique()
    )

    print(
        f"Total journeys: {len(journeys)}"
    )

    # We expect 100 journeys.
    if len(journeys) != 100:

        raise ValueError(
            f"Expected 100 journeys, "
            f"found {len(journeys)}"
        )

    # Deterministic split.
    train_journeys = journeys[:70]

    validation_journeys = journeys[70:85]

    test_journeys = journeys[85:100]

    train_df = df[
        df["journey_id"].isin(
            train_journeys
        )
    ]

    validation_df = df[
        df["journey_id"].isin(
            validation_journeys
        )
    ]

    test_df = df[
        df["journey_id"].isin(
            test_journeys
        )
    ]

    train_df.to_csv(
        TRAIN_PATH,
        index=False
    )

    validation_df.to_csv(
        VALIDATION_PATH,
        index=False
    )

    test_df.to_csv(
        TEST_PATH,
        index=False
    )

    print()
    print("Dataset split completed.")

    print()
    print(
        f"Train journeys: "
        f"{len(train_journeys)}"
    )

    print(
        f"Validation journeys: "
        f"{len(validation_journeys)}"
    )

    print(
        f"Test journeys: "
        f"{len(test_journeys)}"
    )

    print()

    print(
        f"Train rows: "
        f"{len(train_df):,}"
    )

    print(
        f"Validation rows: "
        f"{len(validation_df):,}"
    )

    print(
        f"Test rows: "
        f"{len(test_df):,}"
    )

    print()
    print("Target distribution:")
    
    print(
        "\nTRAIN"
    )

    print(
        train_df[
            "dropout_next_60s"
        ].value_counts()
    )

    print(
        "\nVALIDATION"
    )

    print(
        validation_df[
            "dropout_next_60s"
        ].value_counts()
    )

    print(
        "\nTEST"
    )

    print(
        test_df[
            "dropout_next_60s"
        ].value_counts()
    )


if __name__ == "__main__":
    main()