def calculate_reliability(signal, latency, packet_loss):
    """
    Calculate a basic network reliability score.

    Higher signal strength is better.
    Lower latency is better.
    Lower packet loss is better.
    """

    signal_score = signal

    latency_score = max(0, 100 - latency)

    packet_loss_score = max(0, 100 - (packet_loss * 10))

    reliability_score = (
        0.5 * signal_score
        + 0.3 * latency_score
        + 0.2 * packet_loss_score
    )

    return round(reliability_score, 2)