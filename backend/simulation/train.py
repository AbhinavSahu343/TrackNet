class TrainSimulator:

    ROUTE = [
        {
            "name": "Mumbai",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "distance_km": 0.0
        },
        {
            "name": "Surat",
            "latitude": 21.1702,
            "longitude": 72.8311,
            "distance_km": 280.0
        },
        {
            "name": "Vadodara",
            "latitude": 22.3072,
            "longitude": 73.1812,
            "distance_km": 400.0
        },
        {
            "name": "Ratlam",
            "latitude": 23.3315,
            "longitude": 75.0367,
            "distance_km": 650.0
        },
        {
            "name": "Kota",
            "latitude": 25.2138,
            "longitude": 75.8648,
            "distance_km": 900.0
        },
        {
            "name": "Delhi",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "distance_km": 1380.0
        }
    ]

    def __init__(self, speed_kmph=90.0):

        self.speed_kmph = speed_kmph

        self.current_distance_km = 0.0

        self.finished = False

    def get_current_position(self):

        distance = self.current_distance_km

        # End of journey
        if distance >= self.ROUTE[-1]["distance_km"]:

            destination = self.ROUTE[-1]

            return {
                "name": destination["name"],
                "latitude": destination["latitude"],
                "longitude": destination["longitude"],
                "distance_km": destination["distance_km"],
                "speed_kmph": 0.0,
                "finished": True
            }

        # Find the two route points surrounding
        # the current train position.
        for i in range(len(self.ROUTE) - 1):

            start = self.ROUTE[i]
            end = self.ROUTE[i + 1]

            if start["distance_km"] <= distance <= end["distance_km"]:

                segment_distance = (
                    end["distance_km"]
                    - start["distance_km"]
                )

                progress = (
                    distance - start["distance_km"]
                ) / segment_distance

                latitude = (
                    start["latitude"]
                    + progress
                    * (
                        end["latitude"]
                        - start["latitude"]
                    )
                )

                longitude = (
                    start["longitude"]
                    + progress
                    * (
                        end["longitude"]
                        - start["longitude"]
                    )
                )

                return {
                    "name": start["name"],
                    "latitude": round(latitude, 6),
                    "longitude": round(longitude, 6),
                    "distance_km": round(distance, 3),
                    "speed_kmph": self.speed_kmph,
                    "finished": False
                }

        return None

    def move(self, seconds=5):

        if self.finished:
            return self.get_current_position()

        distance_moved = (
            self.speed_kmph
            * seconds
            / 3600
        )

        self.current_distance_km += distance_moved

        if self.current_distance_km >= self.ROUTE[-1]["distance_km"]:

            self.current_distance_km = (
                self.ROUTE[-1]["distance_km"]
            )

            self.finished = True

        return self.get_current_position()

    def reset(self):

        self.current_distance_km = 0.0
        self.finished = False

        return self.get_current_position()