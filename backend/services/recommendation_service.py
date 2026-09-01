class RecommendationService:

    THRESHOLD = 0.60

    def recommend(
        self,
        predictions,
        current_network=None
    ):

        if not predictions:

            return {
                "recommended_network": None,
                "status": "NO_DATA",
                "reason": (
                    "No network predictions available."
                ),
                "threshold": self.THRESHOLD,
                "networks": {}
            }

        # --------------------------------------------------
        # SCORE ALL NETWORKS
        # --------------------------------------------------

        scored_networks = {}

        for network, prediction in predictions.items():

            dropout_probability = float(
                prediction["dropout_probability"]
            )

            scored_networks[network] = {

                "dropout_probability":
                    round(
                        dropout_probability,
                        4
                    ),

                "risk_score":
                    round(
                        dropout_probability,
                        4
                    )
            }

        # --------------------------------------------------
        # IF CURRENT NETWORK EXISTS
        # --------------------------------------------------

        if (
            current_network
            and current_network in scored_networks
        ):

            current_probability = (
                scored_networks[
                    current_network
                ]["dropout_probability"]
            )

            # ------------------------------------------------
            # CURRENT NETWORK IS SAFE
            #
            # Stay connected.
            # Do NOT switch merely because another carrier
            # has a lower risk.
            # ------------------------------------------------

            if current_probability < self.THRESHOLD:

                return {

                    "recommended_network":
                        current_network,

                    "dropout_probability":
                        current_probability,

                    "status":
                        "SAFE",

                    "reason":
                        (
                            f"{current_network} remains "
                            "below the dropout risk "
                            "threshold."
                        ),

                    "threshold":
                        self.THRESHOLD,

                    "networks":
                        scored_networks
                }

        # --------------------------------------------------
        # CURRENT NETWORK IS AT RISK
        # OR THERE IS NO CURRENT NETWORK
        # --------------------------------------------------

        # Find the lowest-risk network.
        best_network = min(
            scored_networks,
            key=lambda network:
                scored_networks[
                    network
                ]["risk_score"]
        )

        best_probability = (
            scored_networks[
                best_network
            ]["dropout_probability"]
        )

        # --------------------------------------------------
        # CHECK IF ALL NETWORKS ARE AT RISK
        # --------------------------------------------------

        all_at_risk = all(

            network_data[
                "dropout_probability"
            ] >= self.THRESHOLD

            for network_data
            in scored_networks.values()
        )

        if all_at_risk:

            return {

                "recommended_network":
                    current_network
                    if current_network in scored_networks
                    else best_network,

                "dropout_probability":
                    (
                        scored_networks[
                            current_network
                        ]["dropout_probability"]
                        if current_network in scored_networks
                        else best_probability
                    ),

                "status":
                    "ALL_NETWORKS_AT_RISK",

                "reason":
                    (
                        "All available networks have "
                        "high predicted dropout risk."
                    ),

                "threshold":
                    self.THRESHOLD,

                "networks":
                    scored_networks
            }

        # --------------------------------------------------
        # CURRENT NETWORK IS AT RISK
        #
        # Find the safest ALTERNATIVE.
        # --------------------------------------------------

        alternative_networks = {

            network: data

            for network, data
            in scored_networks.items()

            if network != current_network
        }

        # --------------------------------------------------
        # No alternative network available
        # --------------------------------------------------

        if not alternative_networks:

            return {

                "recommended_network":
                    current_network,

                "dropout_probability":
                    scored_networks[
                        current_network
                    ]["dropout_probability"],

                "status":
                    "BEST_AVAILABLE_RISKY",

                "reason":
                    (
                        f"{current_network} is at high "
                        "dropout risk and no alternative "
                        "network is available."
                    ),

                "threshold":
                    self.THRESHOLD,

                "networks":
                    scored_networks
            }

        # --------------------------------------------------
        # SAFEST ALTERNATIVE
        # --------------------------------------------------

        best_alternative = min(

            alternative_networks,

            key=lambda network:
                alternative_networks[
                    network
                ]["risk_score"]
        )

        alternative_probability = (
            alternative_networks[
                best_alternative
            ]["dropout_probability"]
        )

        # --------------------------------------------------
        # ALTERNATIVE IS SAFE
        #
        # SWITCH REQUIRED
        # --------------------------------------------------

        if alternative_probability < self.THRESHOLD:

            return {

                "recommended_network":
                    best_alternative,

                "dropout_probability":
                    alternative_probability,

                "status":
                    "SWITCH_REQUIRED",

                "reason":
                    (
                        f"{current_network} has reached "
                        "the dropout risk threshold. "
                        f"Switch to {best_alternative}."
                    ),

                "threshold":
                    self.THRESHOLD,

                "networks":
                    scored_networks
            }

        # --------------------------------------------------
        # ALTERNATIVE ALSO RISKY
        # --------------------------------------------------

        return {

            "recommended_network":
                best_alternative,

            "dropout_probability":
                alternative_probability,

            "status":
                "BEST_AVAILABLE_RISKY",

            "reason":
                (
                    f"{current_network} is at high "
                    "dropout risk, but {best_alternative} "
                    "has the lowest available risk."
                ),

            "threshold":
                self.THRESHOLD,

            "networks":
                scored_networks
        }