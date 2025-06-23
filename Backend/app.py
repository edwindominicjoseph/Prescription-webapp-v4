from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import auth_router
from model_predict import model_router
from users import user_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(model_router, prefix="/predict")
app.include_router(user_router, prefix="/user")
