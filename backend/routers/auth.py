from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_ANON_KEY  # Usually use anon key for client-side auth actions
) if SUPABASE_URL and SUPABASE_ANON_KEY else None

# Admin client for signup to avoid confirmation email throttling (requires SERVICE_ROLE)
adm_supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE
) if SUPABASE_URL and SUPABASE_SERVICE_ROLE else None



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


class SignupRequest(BaseModel):
    email: str
    password: str


@router.post("/signup", response_model=LoginResponse)
async def signup(credentials: SignupRequest):
    try:
        # Use service-role/admin client for signup to reduce/avoid email confirmation throttling.
        # Note: behavior still depends on Supabase project settings (email confirmations may still be enforced).
        if not adm_supabase:
            raise HTTPException(status_code=500, detail="Supabase SERVICE_ROLE not configured")

        res = adm_supabase.auth.admin.create_user({
            "email": credentials.email,
            "password": credentials.password,
        })



        # If sign-up auto-confirms, session will exist; otherwise the session may be missing.
        access_token = None
        user_id = None
        if getattr(res, "session", None) and getattr(res.session, "access_token", None):
            access_token = res.session.access_token
        if getattr(res, "user", None) and getattr(res.user, "id", None):
            user_id = res.user.id

        if not access_token:
            # Still return something useful for UI; token will be unavailable until confirmed.
            raise HTTPException(
                status_code=400,
                detail="Account created. If your Supabase project requires email confirmation, please confirm your email before logging in.",
            )

        return LoginResponse(access_token=access_token, user_id=user_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

