from fastapi import FastAPI

from backend.simulation.train import TrainSimulator
from backend.simulation.telemetry import TelemetryGenerator


app = FastAPI(
    title="TRACKNET API",
    description="Edge-AI railway connectivity backend",
    version="0.1.0"
)


train = TrainSimulator()
telemetry_generator = TelemetryGenerator(train)

@app.get("/")
def root():

    return {
        "system": "TRACKNET",
        "status": "online",
        "message": "TRACKNET backend is running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


@app.get("/train/location")
def train_location():

    return train.get_current_position()


@app.post("/train/move")
def move_train():

    return train.move()


@app.get("/telemetry/current")
def current_telemetry():

    return telemetry_generator.generate_current_telemetry()