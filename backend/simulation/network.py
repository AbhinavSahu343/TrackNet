import random


NETWORKS = [
    "Jio",
    "Airtel",
    "Vi"
]


# Base signal strength at different points
# along the Mumbai → Delhi route.
NETWORK_PROFILES = {

    "Jio": {
        0: 88,
        250: 84,
        500: 72,
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
        1000: 70,
        1200: 82,
        1380: 88
    },

    "Vi": {
        0: 70,
        250: 74,
        500: 84,
        750: 88,
        1000: 80,
        1200: 68,
        1380: 76
    }
}


# Artificial degradation zones.
#
# These are simulation assumptions.
# They are NOT real carrier coverage maps.

DEGRADATION_ZONES = {

    "Jio": [
        (680, 780, 30)
    ],

    "Airtel": [
        (950, 1050, 35)
    ],

    "Vi": [
        (1120, 1220, 30)
    ]
}


def interpolate_signal(profile, distance_km):

    distances = sorted(profile.keys())

    if distance_km <= distances[0]:
        return profile[distances[0]]

    if distance_km >= distances[-1]:
        return profile[distances[-1]]

    for i in range(len(distances) - 1):

        left = distances[i]
        right = distances[i + 1]

        if left <= distance_km <= right:

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


def get_degradation(distance_km, network):

    for start, end, penalty in DEGRADATION_ZONES.get(
        network,
        []
    ):

        if start <= distance_km <= end:

            # Strongest degradation in the middle
            # of the zone.
            midpoint = (start + end) / 2
            half_width = (end - start) / 2

            distance_from_midpoint = abs(
                distance_km - midpoint
            )

            severity = (
                1
                - distance_from_midpoint
                / half_width
            )

            return penalty * severity

    return 0


def generate_network_telemetry(
    distance_km,
    previous_state=None
):

    telemetry = {}

    if previous_state is None:
        previous_state = {}

    for network in NETWORKS:

        base_signal = interpolate_signal(
            NETWORK_PROFILES[network],
            distance_km
        )

        degradation = get_degradation(
            distance_km,
            network
        )

        target_signal = (
            base_signal
            - degradation
        )

        previous_signal = previous_state.get(
            network,
            target_signal
        )

        # Smooth movement toward the target.
        #
        # This prevents unrealistic jumps.
        signal = (
            previous_signal * 0.75
            + target_signal * 0.25
        )

        # Small measurement noise.
        signal += random.gauss(0, 1.5)

        signal = max(
            0,
            min(100, signal)
        )

        signal_ratio = signal / 100

        latency = (
            25
            + (1 - signal_ratio) * 120
            + random.gauss(0, 3)
        )

        packet_loss = (
            max(
                0,
                (1 - signal_ratio) * 8
                + random.gauss(0, 0.3)
            )
        )

        download_speed = (
            max(
                0,
                signal_ratio * 80
                + random.gauss(0, 3)
            )
        )

        upload_speed = (
            max(
                0,
                signal_ratio * 25
                + random.gauss(0, 1)
            )
        )

        telemetry[network] = {
            "signal_strength": round(
                signal,
                2
            ),

            "latency_ms": round(
                latency,
                2
            ),

            "packet_loss_percent": round(
                packet_loss,
                2
            ),

            "download_speed_mbps": round(
                download_speed,
                2
            ),

            "upload_speed_mbps": round(
                upload_speed,
                2
            )
        }

    return telemetry