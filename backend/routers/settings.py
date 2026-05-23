from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE) if SUPABASE_URL and SUPABASE_SERVICE_ROLE else None

class AppSettings(BaseModel):
    ai_provider: str
    ai_api_key: str

@router.get("/", response_model=AppSettings)
async def get_settings():
    if supabase is None:
        return AppSettings(ai_provider="claude", ai_api_key="")

    res = supabase.table("app_settings").select("*").eq("id", 1).maybe_single().execute()
    if res is None or res.data is None:
        return AppSettings(ai_provider="claude", ai_api_key="")
    return AppSettings(**res.data)

@router.post("/", response_model=AppSettings)
async def update_settings(settings: AppSettings):
    # Upsert logic (insert or update row with id = 1)
    data = {
        "id": 1,
        "ai_provider": settings.ai_provider,
        "ai_api_key": settings.ai_api_key
    }
    res = supabase.table("app_settings").upsert(data).execute()
    if res is None or res.data is None:
        raise HTTPException(status_code=500, detail="Unable to save settings")
    return AppSettings(**res.data[0])
