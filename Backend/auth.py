from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import JSONResponse

auth_router = APIRouter()

@auth_router.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    if email == "edwin@gmail.com" and password == "password123":
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")
