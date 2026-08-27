from backend.services.simulation_service import (
    SimulationService
)


def main():

    print(
        "Testing SimulationService..."
    )

    print()

    service = SimulationService()

    for step in range(20):

        state = service.step()

        telemetry = state["telemetry"]

        recommendation = (
            state["recommendation"]
        )

        print(
            f"STEP {state['step']:02d} | "
            f"Distance: "
            f"{telemetry['distance_km']:.3f} km | "
            f"Status: "
            f"{recommendation['status']}"
        )

        if (
            recommendation[
                "recommended_network"
            ]
            is not None
        ):

            print(
                "  Recommended:",
                recommendation[
                    "recommended_network"
                ]
            )

    print()

    print(
        "SimulationService test completed."
    )


if __name__ == "__main__":

    main()