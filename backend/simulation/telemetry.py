from datetime import datetime, timezone

from backend.simulation.train import TrainSimulator
from backend.simulation.network import generate_network_telemetry


class TelemetryGenerator:

    def __init__(self, train):
        self.train = train

    def generate_current_telemetry(self):

        position = self.train.get_current_position()

        network_data = generate_network_telemetry(
            position["distance_km"]
        )

        telemetry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "route": "Mumbai-Delhi",
            "location": position["name"],
            "latitude": position["latitude"],
            "longitude": position["longitude"],
            "distance_km": position["distance_km"],
            "networks": network_data
        }

        return telemetry

    def move_and_generate(self):

        self.train.move_next()

        return self.generate_current_telemetry()


def flatten_telemetry(telemetry):

    rows = []

    for network_name, metrics in telemetry["networks"].items():

        row = {
            "timestamp": telemetry["timestamp"],
            "route": telemetry["route"],
            "location": telemetry["location"],
            "latitude": telemetry["latitude"],
            "longitude": telemetry["longitude"],
            "distance_km": telemetry["distance_km"],
            "network": network_name,
            **metrics
        }

        rows.append(row)

    return rows


if __name__ == "__main__":

    generator = TelemetryGenerator()

    telemetry = generator.generate_current_telemetry()

    rows = flatten_telemetry(telemetry)

    for row in rows:
        print(row)