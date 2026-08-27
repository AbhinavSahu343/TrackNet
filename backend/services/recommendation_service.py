class RecommendationService:

    THRESHOLD = 0.80

    def recommend(self, predictions):

        if not predictions:

            return {
                "recommended_network": None,
                "status": "NO_DATA",
                "reason": "No network predictions available.",
                "networks": {}
            }

        scored_networks = {}

        for network, prediction in predictions.items():

            dropout_probability = prediction[
                "dropout_probability"
            ]

            # Lower dropout probability = better
            risk_score = dropout_probability

            scored_networks[network] = {
                "dropout_probability":
                    round(
                        dropout_probability,
                        4
                    ),

                "risk_score":
                    round(
                        risk_score,
                        4
                    )
            }

        # -----------------------------------------
        # Select lowest-risk network
        # -----------------------------------------

        best_network = min(
            scored_networks,
            key=lambda network:
                scored_networks[network]["risk_score"]
        )

        best_probability = scored_networks[
            best_network
        ]["dropout_probability"]

        # -----------------------------------------
        # Determine status
        # -----------------------------------------

        all_at_risk = all(

            network_data[
                "dropout_probability"
            ] >= self.THRESHOLD

            for network_data
            in scored_networks.values()
        )

        if all_at_risk:

            status = "ALL_NETWORKS_AT_RISK"

            reason = (
                "All available networks have "
                "high predicted dropout risk."
            )

        elif best_probability >= self.THRESHOLD:

            status = "BEST_AVAILABLE_RISKY"

            reason = (
                f"{best_network} has the lowest "
                "predicted dropout risk, but "
                "the risk remains high."
            )

        else:

            status = "SAFE"

            reason = (
                f"{best_network} currently has "
                "the lowest predicted dropout risk."
            )

        return {

            "recommended_network":
                best_network,

            "dropout_probability":
                best_probability,

            "status":
                status,

            "reason":
                reason,

            "threshold":
                self.THRESHOLD,

            "networks":
                scored_networks
        }