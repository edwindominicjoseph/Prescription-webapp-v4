from fastapi import APIRouter

model_router = APIRouter()

@model_router.post("")
def predict_placeholder():
    """Placeholder endpoint for model predictions."""
    return {"detail": "model prediction placeholder"}
