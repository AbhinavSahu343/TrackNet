import os
import sys
from datetime import datetime, timedelta, timezone

import pandas as pd


# Allow imports from the TrackNet root.
ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)


from backend.simulation.train import TrainSimulator
from backend.simulation.network import (
    generate_network_telemetry,
)

from ml.labels import is_dropout


# Simulation configuration

NUM_JOURNEYS = 100

INTERVAL_SECONDS = 5

PREDICTION_HORIZON_SECONDS = 60

FUTURE_STEPS = (
    PREDICTION_HORIZON_SECONDS
    // INTERVAL_SECONDS
)


def generate_single_journey(journey_id):

    train = TrainSimulator()

    previous_network_state = {}

    rows = []

    start_time = datetime(
        2026,
        1,
        1,
        8,
        0,
        0,
        tzinfo=timezone.utc
    )

    step = 0

    while True:

        position = train.get_current_position()

        network_data = generate_network_telemetry(
            position["distance_km"],
            previous_network_state
        )

        previous_network_state = {
            network: metrics["signal_strength"]
            for network, metrics
            in network_data.items()
        }

        timestamp = (
            start_time
            + timedelta(
                seconds=step * INTERVAL_SECONDS
            )
        )

        for network, metrics in network_data.items():

            row = {
                "journey_id": journey_id,

                "timestamp": timestamp.isoformat(),

                "route": "Mumbai-Delhi",

                "latitude": position["latitude"],

                "longitude": position["longitude"],

                "distance_km": position[
                    "distance_km"
                ],

                "speed_kmph": position[
                    "speed_kmph"
                ],

                "network": network,

                "signal_strength": metrics[
                    "signal_strength"
                ],

                "latency_ms": metrics[
                    "latency_ms"
                ],

                "packet_loss_percent": metrics[
                    "packet_loss_percent"
                ],

                "download_speed_mbps": metrics[
                    "download_speed_mbps"
                ],

                "upload_speed_mbps": metrics[
                    "upload_speed_mbps"
                ]
            }

            rows.append(row)

        if position["finished"]:
            break

        train.move(INTERVAL_SECONDS)

        step += 1

    return rows


def create_future_labels(df):

    df = df.copy()

    # Initially mark every row as 0.
    df["dropout_next_60s"] = 0

    # Process each journey and carrier independently.
    for (journey_id, network), group in df.groupby(
        ["journey_id", "network"]
    ):

        group = group.sort_values(
            "timestamp"
        )

        indices = group.index.tolist()

        dropout_states = [
            is_dropout(
                row["signal_strength"],
                row["latency_ms"],
                row["packet_loss_percent"]
            )
            for _, row in group.iterrows()
        ]

        for i, current_index in enumerate(indices):

            future_start = i + 1

            future_end = min(
                i + FUTURE_STEPS + 1,
                len(dropout_states)
            )

            future_states = dropout_states[
                future_start:future_end
            ]

            if any(future_states):

                df.loc[
                    current_index,
                    "dropout_next_60s"
                ] = 1

    return df


def main():

    all_rows = []

    print(
        f"Generating {NUM_JOURNEYS} journeys..."
    )

    for journey_id in range(
        1,
        NUM_JOURNEYS + 1
    ):

        print(
            f"Generating journey {journey_id}/"
            f"{NUM_JOURNEYS}"
        )

        rows = generate_single_journey(
            journey_id
        )

        all_rows.extend(rows)

    print("Creating DataFrame...")

    df = pd.DataFrame(all_rows)

    print("Creating 60-second labels...")

    df = create_future_labels(df)

    output_directory = os.path.join(
        ROOT_DIR,
        "ml",
        "data",
        "raw"
    )

    os.makedirs(
        output_directory,
        exist_ok=True
    )

    output_path = os.path.join(
        output_directory,
        "telemetry_raw.csv"
    )

    df.to_csv(
        output_path,
        index=False
    )

    print()
    print(
        "Dataset generated successfully."
    )

    print(
        f"Rows: {len(df):,}"
    )

    print(
        f"Columns: {len(df.columns)}"
    )

    print(
        f"Saved to: {output_path}"
    )

    print()
    print("Class distribution:")

    print(
        df[
            "dropout_next_60s"
        ].value_counts()
    )


if __name__ == "__main__":
    main()