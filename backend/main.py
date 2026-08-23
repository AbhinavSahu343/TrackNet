from data_loader import load_network_data
from core.reliability import find_best_network


def main():

    file_path = "data/networks.csv"

    networks = load_network_data(file_path)

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