from backend.services.recommendation_service import (
    RecommendationService
)


service = RecommendationService()


predictions = {

    "Jio": {
        "dropout_probability": 0.94
    },

    "Airtel": {
        "dropout_probability": 0.21
    },

    "Vi": {
        "dropout_probability": 0.67
    }
}


result = service.recommend(
    predictions
)


print(result)