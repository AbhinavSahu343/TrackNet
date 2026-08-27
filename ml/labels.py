def is_dropout(
    signal_strength,
    latency_ms,
    packet_loss_percent
):
    """
    Determine whether a simulated network state
    qualifies as a connectivity dropout.

    These thresholds are engineering assumptions
    for the synthetic prototype.
    """

    if signal_strength < 35:
        return True

    if latency_ms > 120:
        return True

    if packet_loss_percent > 6:
        return True

    return False