import pandas as pd


def add_features(df):

    df = df.copy()

    df = df.sort_values(
        ["journey_id", "network", "timestamp"]
    )

    grouped = df.groupby(
        ["journey_id", "network"],
        group_keys=False
    )

    # ==========================================
    # SIGNAL FEATURES
    # ==========================================

    df["signal_change_5s"] = grouped[
        "signal_strength"
    ].diff(1)

    df["signal_change_20s"] = grouped[
        "signal_strength"
    ].diff(4)

    df["signal_change_40s"] = grouped[
        "signal_strength"
    ].diff(8)

    df["signal_change_60s"] = grouped[
        "signal_strength"
    ].diff(12)

    df["signal_mean_20s"] = grouped[
        "signal_strength"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).mean()
    )

    df["signal_mean_40s"] = grouped[
        "signal_strength"
    ].transform(
        lambda x: x.rolling(
            8,
            min_periods=8
        ).mean()
    )

    df["signal_mean_60s"] = grouped[
        "signal_strength"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).mean()
    )

    df["signal_min_20s"] = grouped[
        "signal_strength"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).min()
    )

    df["signal_min_60s"] = grouped[
        "signal_strength"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).min()
    )

    df["signal_max_20s"] = grouped[
        "signal_strength"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).max()
    )

    # ==========================================
    # LATENCY FEATURES
    # ==========================================

    df["latency_change_20s"] = grouped[
        "latency_ms"
    ].diff(4)

    df["latency_change_40s"] = grouped[
        "latency_ms"
    ].diff(8)

    df["latency_change_60s"] = grouped[
        "latency_ms"
    ].diff(12)

    df["latency_mean_20s"] = grouped[
        "latency_ms"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).mean()
    )

    df["latency_mean_60s"] = grouped[
        "latency_ms"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).mean()
    )

    df["latency_max_20s"] = grouped[
        "latency_ms"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).max()
    )

    df["latency_max_60s"] = grouped[
        "latency_ms"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).max()
    )

    # ==========================================
    # PACKET LOSS
    # ==========================================

    df["packet_loss_mean_20s"] = grouped[
        "packet_loss_percent"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).mean()
    )

    df["packet_loss_mean_60s"] = grouped[
        "packet_loss_percent"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).mean()
    )

    df["packet_loss_max_20s"] = grouped[
        "packet_loss_percent"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).max()
    )

    df["packet_loss_max_60s"] = grouped[
        "packet_loss_percent"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).max()
    )

    # ==========================================
    # SPEED
    # ==========================================

    df["speed_mean_20s"] = grouped[
        "speed_kmph"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).mean()
    )

    # ==========================================
    # DATA SPEED
    # ==========================================

    df["download_mean_20s"] = grouped[
        "download_speed_mbps"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).mean()
    )

    df["download_mean_60s"] = grouped[
        "download_speed_mbps"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).mean()
    )

    df["upload_mean_20s"] = grouped[
        "upload_speed_mbps"
    ].transform(
        lambda x: x.rolling(
            4,
            min_periods=4
        ).mean()
    )

    df["upload_mean_60s"] = grouped[
        "upload_speed_mbps"
    ].transform(
        lambda x: x.rolling(
            12,
            min_periods=12
        ).mean()
    )

    return df

def build_realtime_features(history):

    """
    Build features from a chronological list of telemetry
    observations.

    `history` must contain dictionaries ordered from oldest
    to newest.
    """

    if not history:

        raise ValueError(
            "History cannot be empty."
        )

    df = pd.DataFrame(history)

    # Make sure newest observation is last.
    df = df.reset_index(drop=True)

    features = {}

    current = df.iloc[-1]

    # ==========================================
    # Current telemetry
    # ==========================================

    current_columns = [

        "signal_strength",
        "latency_ms",
        "packet_loss_percent",
        "download_speed_mbps",
        "upload_speed_mbps",
        "latitude",
        "longitude",
        "distance_km",
        "speed_kmph"
    ]

    for column in current_columns:

        features[column] = float(
            current[column]
        )

    # ==========================================
    # Helper
    # ==========================================

    def difference(
        column,
        steps
    ):

        if len(df) <= steps:

            return 0.0

        return float(
            df[column].iloc[-1]
            - df[column].iloc[-1 - steps]
        )

    def rolling_mean(
        column,
        window
    ):

        values = df[column].tail(
            window
        )

        return float(
            values.mean()
        )

    def rolling_min(
        column,
        window
    ):

        values = df[column].tail(
            window
        )

        return float(
            values.min()
        )

    def rolling_max(
        column,
        window
    ):

        values = df[column].tail(
            window
        )

        return float(
            values.max()
        )

    # ==========================================
    # Signal
    # ==========================================

    features[
        "signal_change_5s"
    ] = difference(
        "signal_strength",
        1
    )

    features[
        "signal_change_20s"
    ] = difference(
        "signal_strength",
        4
    )

    features[
        "signal_change_40s"
    ] = difference(
        "signal_strength",
        8
    )

    features[
        "signal_change_60s"
    ] = difference(
        "signal_strength",
        12
    )

    features[
        "signal_mean_20s"
    ] = rolling_mean(
        "signal_strength",
        4
    )

    features[
        "signal_mean_40s"
    ] = rolling_mean(
        "signal_strength",
        8
    )

    features[
        "signal_mean_60s"
    ] = rolling_mean(
        "signal_strength",
        12
    )

    features[
        "signal_min_20s"
    ] = rolling_min(
        "signal_strength",
        4
    )

    features[
        "signal_min_60s"
    ] = rolling_min(
        "signal_strength",
        12
    )

    features[
        "signal_max_20s"
    ] = rolling_max(
        "signal_strength",
        4
    )

    # ==========================================
    # Latency
    # ==========================================

    features[
        "latency_change_20s"
    ] = difference(
        "latency_ms",
        4
    )

    features[
        "latency_change_40s"
    ] = difference(
        "latency_ms",
        8
    )

    features[
        "latency_change_60s"
    ] = difference(
        "latency_ms",
        12
    )

    features[
        "latency_mean_20s"
    ] = rolling_mean(
        "latency_ms",
        4
    )

    features[
        "latency_mean_60s"
    ] = rolling_mean(
        "latency_ms",
        12
    )

    features[
        "latency_max_20s"
    ] = rolling_max(
        "latency_ms",
        4
    )

    features[
        "latency_max_60s"
    ] = rolling_max(
        "latency_ms",
        12
    )

    # ==========================================
    # Packet loss
    # ==========================================

    features[
        "packet_loss_mean_20s"
    ] = rolling_mean(
        "packet_loss_percent",
        4
    )

    features[
        "packet_loss_mean_60s"
    ] = rolling_mean(
        "packet_loss_percent",
        12
    )

    features[
        "packet_loss_max_20s"
    ] = rolling_max(
        "packet_loss_percent",
        4
    )

    features[
        "packet_loss_max_60s"
    ] = rolling_max(
        "packet_loss_percent",
        12
    )

    # ==========================================
    # Speed
    # ==========================================

    features[
        "speed_mean_20s"
    ] = rolling_mean(
        "speed_kmph",
        4
    )

    # ==========================================
    # Download
    # ==========================================

    features[
        "download_mean_20s"
    ] = rolling_mean(
        "download_speed_mbps",
        4
    )

    features[
        "download_mean_60s"
    ] = rolling_mean(
        "download_speed_mbps",
        12
    )

    # ==========================================
    # Upload
    # ==========================================

    features[
        "upload_mean_20s"
    ] = rolling_mean(
        "upload_speed_mbps",
        4
    )

    features[
        "upload_mean_60s"
    ] = rolling_mean(
        "upload_speed_mbps",
        12
    )

    return features