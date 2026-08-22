from core.reliability import calculate_reliability


def main():
    jio_score = calculate_reliability(
        signal=80,
        latency=40,
        packet_loss=2
    )

    airtel_score = calculate_reliability(
        signal=90,
        latency=30,
        packet_loss=1
    )

    vi_score = calculate_reliability(
        signal=55,
        latency=90,
        packet_loss=7
    )

    print("RailConnect Network Reliability")
    print("--------------------------------")
    print(f"Jio: {jio_score}")
    print(f"Airtel: {airtel_score}")
    print(f"Vi: {vi_score}")


if __name__ == "__main__":
    main()