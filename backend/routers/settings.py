from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

class AppSettings(BaseModel):
    ai_provider: str
    ai_api_key: str

@router.get("/", response_model=AppSettings)
async def get_settings():
    res = supabase.table("app_settings").select("*").eq("id", 1).maybe_single().execute()
    if res.data:
        return AppSettings(**res.data)
    return AppSettings(ai_provider="claude", ai_api_key="")

@router.post("/", response_model=AppSettings)
async def update_settings(settings: AppSettings):
    # Upsert logic (insert or update row with id = 1)
    data = {
        "id": 1,
        "ai_provider": settings.ai_provider,
        "ai_api_key": settings.ai_api_key
    }
    res = supabase.table("app_settings").upsert(data).execute()
    return AppSettings(**res.data[0])
