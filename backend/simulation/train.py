ROUTE = [
    {
        "name": "Mumbai",
        "latitude": 19.0760,
        "longitude": 72.8777,
        "distance_km": 0
    },
    {
        "name": "Surat",
        "latitude": 21.1702,
        "longitude": 72.8311,
        "distance_km": 280
    },
    {
        "name": "Vadodara",
        "latitude": 22.3072,
        "longitude": 73.1812,
        "distance_km": 400
    },
    {
        "name": "Ratlam",
        "latitude": 23.3315,
        "longitude": 75.0367,
        "distance_km": 650
    },
    {
        "name": "Kota",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "distance_km": 850
    },
    {
        "name": "New Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "distance_km": 1380
    }

]
class TrainSimulator:

    def __init__(self):
        self.current_index = 0

    def get_current_position(self):
        return ROUTE[self.current_index]

    def move_next(self):
        if self.current_index < len(ROUTE) - 1:
            self.current_index += 1

        return self.get_current_position()

def get_train_state():

    simulator = TrainSimulator()

    return simulator.get_current_position()

if __name__ == "__main__":

    simulator = TrainSimulator()

    print("Current position:")
    print(simulator.get_current_position())

    print("\nMoving train...")

    print(simulator.move_next())