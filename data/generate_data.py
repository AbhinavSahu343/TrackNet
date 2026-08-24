import csv
import random
from datetime import datetime, timedelta


ROUTE = "Delhi-Lucknow"

locations = [
    {
        "name": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "distance_km": 0
    },
    {
        "name": "Ghaziabad",
        "latitude": 28.6692,
        "longitude": 77.4538,
        "distance_km": 30
    },
    {
        "name": "Hapur",
        "latitude": 28.7306,
        "longitude": 77.7759,
        "distance_km": 70
    },
    {
        "name": "Moradabad",
        "latitude": 28.8386,
        "longitude": 78.7733,
        "distance_km": 160
    },
    {
        "name": "Bareilly",
        "latitude": 28.3670,
        "longitude": 79.4304,
        "distance_km": 250
    },
    {
        "name": "Shahjahanpur",
        "latitude": 27.8837,
        "longitude": 79.9120,
        "distance_km": 330
    },
    {
        "name": "Lucknow",
        "latitude": 26.8467,
        "longitude": 80.9462,
        "distance_km": 500
    }
]


networks = {
    "Jio": {
        "signal_base": 82,
        "latency_base": 40,
        "packet_loss_base": 2,
        "download_base": 40,
        "upload_base": 12
    },

    "Airtel": {
        "signal_base": 85,
        "latency_base": 35,
        "packet_loss_base": 1.5,
        "download_base": 45,
        "upload_base": 14
    },

    "Vi": {
        "signal_base": 68,
        "latency_base": 55,
        "packet_loss_base": 3,
        "download_base": 25,
        "upload_base": 8
    }
}


def generate_measurement(network_info):
    """
    Generate one realistic-looking network observation
    around the network's baseline values.
    """

    signal = network_info["signal_base"] + random.uniform(-12, 12)

    latency = network_info["latency_base"] + random.uniform(-10, 20)

    packet_loss = (
        network_info["packet_loss_base"]
        + random.uniform(-0.8, 2)
    )

    download_speed = (
        network_info["download_base"]
        + random.uniform(-10, 10)
    )

    upload_speed = (
        network_info["upload_base"]
        + random.uniform(-4, 4)
    )

    return {
        "signal_strength": round(max(0, min(100, signal)), 2),
        "latency_ms": round(max(5, latency), 2),
        "packet_loss_percent": round(max(0, packet_loss), 2),
        "download_speed_mbps": round(max(0, download_speed), 2),
        "upload_speed_mbps": round(max(0, upload_speed), 2)
    }


def generate_dataset():

    output_file = "data/raw/railway_network_data.csv"

    start_time = datetime(2026, 8, 23, 10, 0, 0)

    rows = []

    for location in locations:

        for network_name, network_info in networks.items():

            measurement = generate_measurement(network_info)

            row = {
                "timestamp": start_time.isoformat(),
                "route": ROUTE,
                "location": location["name"],
                "latitude": location["latitude"],
                "longitude": location["longitude"],
                "distance_km": location["distance_km"],
                "network": network_name,
                **measurement
            }

            rows.append(row)

        start_time += timedelta(minutes=30)

    fieldnames = [
        "timestamp",
        "route",
        "location",
        "latitude",
        "longitude",
        "distance_km",
        "network",
        "signal_strength",
        "latency_ms",
        "packet_loss_percent",
        "download_speed_mbps",
        "upload_speed_mbps"
    ]

    with open(output_file, "w", newline="") as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(rows)

    print(f"Dataset generated successfully: {output_file}")
    print(f"Total observations: {len(rows)}")


if __name__ == "__main__":
    generate_dataset()