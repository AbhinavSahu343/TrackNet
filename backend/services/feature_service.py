from collections import defaultdict, deque

from ml.features import build_realtime_features


HISTORY_SIZE = 12


class FeatureEngine:

    def __init__(self):

        self.history = defaultdict(
            lambda: deque(
                maxlen=HISTORY_SIZE
            )
        )

    def update(
        self,
        network: str,
        telemetry: dict
    ):

        self.history[
            network
        ].append(
            telemetry.copy()
        )

        history = list(
            self.history[network]
        )

        return build_realtime_features(
            history
        )

    def is_ready(
        self,
        network: str
    ):

        return (
            len(
                self.history[network]
            )
            >= HISTORY_SIZE
        )