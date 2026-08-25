import random


NETWORKS = {
    "Jio": {},
    "Airtel": {},
    "Vi": {},
    "BSNL": {}
}

NETWORK_PROFILES = {
    "Jio": {
        0: 88,
        200: 82,
        500: 62,
        800: 74,
        1100: 84,
        1380: 78
    },

    "Airtel": {
        0: 84,
        200: 91,
        500: 79,
        800: 66,
        1100: 76,
        1380: 86
    },

    "Vi": {
        0: 65,
        200: 70,
        500: 87,
        800: 81,
        1100: 64,
        1380: 73
    },

    "BSNL": {
        0: 72,
        200: 68,
        500: 73,
        800: 91,
        1100: 82,
        1380: 80
    }
}

def interpolate_signal(profile, distance_km):
    """
    Estimate signal strength at a distance between
    known route points.
    """

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
                (distance_km - left)
                / (right - left)
            )

            return left_signal + (
                right_signal - left_signal
            ) * ratio

def add_variation(value, variation=5):

    return value + random.uniform(
        -variation,
        variation
    )

def generate_metrics(signal):

    signal_ratio = signal / 100

    latency = 100 - (signal_ratio * 65)

    packet_loss = max(
        0,
        8 - (signal_ratio * 7)
    )

    download_speed = max(
        1,
        signal_ratio * 60
    )

    upload_speed = max(
        1,
        signal_ratio * 20
    )

    return {
        "signal_strength": round(signal, 2),
        "latency_ms": round(latency, 2),
        "packet_loss_percent": round(packet_loss, 2),
        "download_speed_mbps": round(
            download_speed, 2
        ),
        "upload_speed_mbps": round(
            upload_speed, 2
        )
    }

def generate_network_telemetry(distance_km):

    telemetry = {}

    for network_name, profile in NETWORK_PROFILES.items():

        base_signal = interpolate_signal(
            profile,
            distance_km
        )

        signal = add_variation(
            base_signal,
            variation=5
        )

        signal = max(
            0,
            min(100, signal)
        )

        metrics = generate_metrics(signal)

        telemetry[network_name] = metrics

    return telemetry

if __name__ == "__main__":

    test_distances = [
        0,
        200,
        500,
        800,
        1100,
        1380
    ]

    for distance in test_distances:

        print()
        print(f"Distance: {distance} km")
        print("-" * 30)

        telemetry = generate_network_telemetry(
            distance
        )

        for network, metrics in telemetry.items():

            print(
                f"{network}: "
                f"{metrics}"
            )