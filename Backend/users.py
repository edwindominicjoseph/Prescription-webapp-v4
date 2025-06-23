from fastapi import APIRouter

user_router = APIRouter()

@user_router.get("/me")
def read_current_user():
    """Placeholder endpoint for retrieving current user info."""
    return {"detail": "user info placeholder"}
