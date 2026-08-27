import random


NETWORKS = [
    "Jio",
    "Airtel",
    "Vi"
]


# ============================================================
# BASE NETWORK SIGNAL PROFILES
# ============================================================

NETWORK_PROFILES = {

    "Jio": {
        0: 88,
        250: 84,
        500: 72,
        650: 68,
        690: 45,
        712.5: 30,
        735: 45,
        750: 60,
        1000: 78,
        1200: 86,
        1380: 82
    },

    "Airtel": {
        0: 82,
        250: 88,
        500: 82,
        750: 78,
        970: 45,
        992.5: 30,
        1015: 45,
        1050: 70,
        1200: 82,
        1380: 88
    },

    "Vi": {
        0: 70,
        250: 74,
        500: 84,
        750: 88,
        1140: 45,
        1162.5: 30,
        1185: 45,
        1200: 68,
        1380: 76
    }
}


# ============================================================
# DEGRADATION ZONES
# ============================================================

DEGRADATION_ZONES = {

    "Jio": [
        (690, 735, 45)
    ],

    "Airtel": [
        (970, 1015, 45)
    ],

    "Vi": [
        (1140, 1185, 45)
    ]
}


# ============================================================
# SIGNAL INTERPOLATION
# ============================================================

def interpolate_signal(
    profile,
    distance_km
):

    distances = sorted(
        profile.keys()
    )

    if distance_km <= distances[0]:

        return profile[
            distances[0]
        ]

    if distance_km >= distances[-1]:

        return profile[
            distances[-1]
        ]

    for i in range(
        len(distances) - 1
    ):

        left = distances[i]
        right = distances[i + 1]

        if (
            left
            <= distance_km
            <= right
        ):

            left_signal = profile[left]
            right_signal = profile[right]

            ratio = (
                distance_km - left
            ) / (
                right - left
            )

            return (
                left_signal
                + ratio
                * (
                    right_signal
                    - left_signal
                )
            )

    return 50


# ============================================================
# DEGRADATION
# ============================================================

def get_degradation(
    distance_km,
    network
):

    for start, end, penalty in (
        DEGRADATION_ZONES.get(
            network,
            []
        )
    ):

        if (
            start
            <= distance_km
            <= end
        ):

            midpoint = (
                start + end
            ) / 2

            half_width = (
                end - start
            ) / 2

            distance_from_midpoint = abs(
                distance_km
                - midpoint
            )

            severity = (
                1
                - (
                    distance_from_midpoint
                    / half_width
                )
            )

            return (
                penalty
                * severity
            )

    return 0


# ============================================================
# NETWORK TELEMETRY GENERATION
# ============================================================

def generate_network_telemetry(
    distance_km,
    previous_state=None
):

    telemetry = {}

    if previous_state is None:

        previous_state = {}


    for network in NETWORKS:

        # ----------------------------------------------------
        # Base signal
        # ----------------------------------------------------

        base_signal = interpolate_signal(
            NETWORK_PROFILES[network],
            distance_km
        )


        # ----------------------------------------------------
        # Geographic degradation
        # ----------------------------------------------------

        degradation = get_degradation(
            distance_km,
            network
        )


        # ----------------------------------------------------
        # Target signal
        #
        # Stronger degradation than before.
        # This makes the simulated telemetry closer
        # to the training data around failure zones.
        # ----------------------------------------------------

        target_signal = (
            base_signal
            - degradation
        )


        # ----------------------------------------------------
        # Temporal smoothing
        #
        # Keep some continuity but allow deterioration
        # to become visible quickly enough.
        # ----------------------------------------------------

        previous_signal = previous_state.get(
            network,
            base_signal
        )

        signal = (
            previous_signal * 0.65
            + target_signal * 0.35
        )


        # ----------------------------------------------------
        # Random measurement noise
        # ----------------------------------------------------

        signal += random.gauss(
            0,
            1.0
        )


        signal = max(
            0,
            min(
                100,
                signal
            )
        )


        # ----------------------------------------------------
        # Degradation factor
        #
        # Becomes significant when signal falls
        # below approximately 50.
        # ----------------------------------------------------

        degradation_factor = max(
            0,
            (50 - signal) / 50
        )


        # ----------------------------------------------------
        # Latency
        # ----------------------------------------------------

        latency = (
            30
            + degradation_factor * 140
            + random.gauss(0, 3)
        )


        # ----------------------------------------------------
        # Packet loss
        # ----------------------------------------------------

        packet_loss = (
            degradation_factor * 9
            + random.gauss(0, 0.25)
        )

        packet_loss = max(
            0,
            packet_loss
        )


        # ----------------------------------------------------
        # Download speed
        # ----------------------------------------------------

        signal_ratio = (
            signal / 100
        )

        download_speed = (
            signal_ratio
            * 80
            * (
                1
                - degradation_factor * 0.6
            )
            + random.gauss(0, 2.5)
        )


        # ----------------------------------------------------
        # Upload speed
        # ----------------------------------------------------

        upload_speed = (
            signal_ratio
            * 25
            * (
                1
                - degradation_factor * 0.5
            )
            + random.gauss(0, 0.8)
        )


        # ----------------------------------------------------
        # Store telemetry
        # ----------------------------------------------------

        telemetry[network] = {

            "signal_strength":
                round(
                    signal,
                    2
                ),

            "latency_ms":
                round(
                    max(
                        0,
                        latency
                    ),
                    2
                ),

            "packet_loss_percent":
                round(
                    packet_loss,
                    2
                ),

            "download_speed_mbps":
                round(
                    max(
                        0,
                        download_speed
                    ),
                    2
                ),

            "upload_speed_mbps":
                round(
                    max(
                        0,
                        upload_speed
                    ),
                    2
                )
        }


    return telemetry