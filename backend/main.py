from fastapi import FastAPI

from backend.simulation.train import TrainSimulator


app = FastAPI(
    title="TRACKNET API",
    description="Edge-AI railway connectivity backend",
    version="0.1.0"
)


train = TrainSimulator()


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

    return train.move_next()