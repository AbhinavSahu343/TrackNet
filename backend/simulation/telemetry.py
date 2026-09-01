from datetime import datetime, timezone

from backend.simulation.train import TrainSimulator
from backend.simulation.network import (
    generate_network_telemetry
)


class TelemetryGenerator:

    def __init__(
        self,
        train=None,
        interval_seconds=5,
        movement_multiplier=1.0
    ):
        self.train = train or TrainSimulator()

        self.interval_seconds = (
            interval_seconds
        )

        # Keep compatibility with SimulationService.
        #
        # movement_multiplier is applied to the amount
        # of simulated time used for each movement step.
        self.movement_multiplier = (
            movement_multiplier
        )

        self.previous_network_state = {}


    def generate_current_telemetry(self):

        position = (
            self.train.get_current_position()
        )

        network_data = (
            generate_network_telemetry(
                position["distance_km"],
                self.previous_network_state
            )
        )

        # Save current signals so the next
        # simulation step can evolve smoothly.
        self.previous_network_state = {
            network: metrics["signal_strength"]
            for network, metrics
            in network_data.items()
        }

        telemetry = {
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),

            "route": "Mumbai-Delhi",

            "location": position["name"],

            "latitude": position["latitude"],

            "longitude": position["longitude"],

            "distance_km": position[
                "distance_km"
            ],

            "speed_kmph": position[
                "speed_kmph"
            ],

            "networks": network_data
        }

        return telemetry


    def move_and_generate(self):

        movement_seconds = (
            self.interval_seconds
            * self.movement_multiplier
        )

        self.train.move(
            movement_seconds
        )

        return (
            self.generate_current_telemetry()
        )


    def reset(self):

        self.train.reset()

        self.previous_network_state = {}

        return (
            self.generate_current_telemetry()
        )


def flatten_telemetry(telemetry):

    rows = []

    for network_name, metrics in (
        telemetry["networks"].items()
    ):

        row = {
            "timestamp":
                telemetry["timestamp"],

            "route":
                telemetry["route"],

            "location":
                telemetry["location"],

            "latitude":
                telemetry["latitude"],

            "longitude":
                telemetry["longitude"],

            "distance_km":
                telemetry["distance_km"],

            "speed_kmph":
                telemetry["speed_kmph"],

            "network":
                network_name,

            **metrics
        }

        rows.append(row)

    return rows


if __name__ == "__main__":

    generator = TelemetryGenerator()

    for step in range(20):

        if step > 0:

            telemetry = (
                generator.move_and_generate()
            )

        else:

            telemetry = (
                generator.generate_current_telemetry()
            )

        print()

        print(
            f"STEP {step}"
        )

        print(
            f"Distance: "
            f"{telemetry['distance_km']:.3f} km"
        )

        print(
            f"GPS: "
            f"{telemetry['latitude']}, "
            f"{telemetry['longitude']}"
        )

        for network, metrics in (
            telemetry["networks"].items()
        ):

            print(
                f"{network}: "
                f"signal="
                f"{metrics['signal_strength']} | "
                f"latency="
                f"{metrics['latency_ms']}ms | "
                f"loss="
                f"{metrics['packet_loss_percent']}%"
            )