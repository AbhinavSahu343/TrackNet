from core.reliability import find_best_network


def main():

    networks = [
        {
            "name": "Jio",
            "signal": 80,
            "latency": 40,
            "packet_loss": 2
        },
        {
            "name": "Airtel",
            "signal": 90,
            "latency": 30,
            "packet_loss": 1
        },
        {
            "name": "Vi",
            "signal": 55,
            "latency": 90,
            "packet_loss": 7
        }
    ]

    best_network = find_best_network(networks)

    print("RailConnect")
    print("-----------")

    for network in networks:
        print(
            f'{network["name"]}: '
            f'{network["reliability_score"]}'
        )

    print()
    print(
        f'Recommended network: '
        f'{best_network["name"]}'
    )


if __name__ == "__main__":
    main()