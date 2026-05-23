from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")  # Usually use anon key for client-side auth actions
)

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user_id: str

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        return LoginResponse(
            access_token=res.session.access_token,
            user_id=res.user.id
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
