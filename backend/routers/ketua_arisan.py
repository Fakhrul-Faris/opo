from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from supabase import create_client
import os

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE) if SUPABASE_URL and SUPABASE_SERVICE_ROLE else None

class KetuaArisanBase(BaseModel):
    name: str = Field(..., example="Sari Listya")
    location: str | None = Field(None, example="Jakarta")
    community_size: int | None = Field(None, example=250)
    platform_presence: str | None = Field(None, example="WhatsApp, TikTok")
    status: str = Field(..., example="active")
    circles_created: int | None = Field(0, example=4)
    members_referred: int | None = Field(0, example=120)
    activation_rate: float | None = Field(None, example=0.74)
    retention_rate: float | None = Field(None, example=0.82)
    last_contact: str | None = Field(None, example="2026-05-15")
    notes: str | None = Field(None, example="High potential community leader")

class KetuaArisanCreate(KetuaArisanBase):
    pass

class KetuaArisan(KetuaArisanBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True

@router.get("", response_model=list)
async def list_ketua_arisan(status: str | None = None):
    if supabase is None:
        return []
    query = supabase.table("ketua_arisan").select("*")
    if status:
        query = query.eq("status", status)
    res = query.execute()
    if res is None or res.data is None:
        raise HTTPException(status_code=500, detail="Unable to load Ketua Arisan profiles")
    return [KetuaArisan(**row).dict() for row in res.data or []]

@router.post("", response_model=KetuaArisan)
async def create_ketua_arisan(record: KetuaArisanCreate):
    res = supabase.table("ketua_arisan").insert(record.dict()).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to create Ketua Arisan profile")
    return KetuaArisan(**res.data[0]).dict()

@router.get("/summary", response_model=dict)
async def ketua_arisan_summary():
    if supabase is None:
        return {
            "total_leaders": 0,
            "total_reach": 0,
            "total_referrals": 0,
            "avg_activation_rate": 0,
            "avg_retention_rate": 0,
        }
    res = supabase.table("ketua_arisan").select(
        "id, community_size, circles_created, members_referred, activation_rate, retention_rate"
    ).execute()
    if res is None or res.data is None:
        raise HTTPException(status_code=500, detail="Unable to load Ketua Arisan summary")

    rows = res.data or []
    total_leaders = len(rows)
    total_reach = sum((row.get("community_size") or 0) for row in rows)
    total_referrals = sum((row.get("members_referred") or 0) for row in rows)
    avg_activation = round(sum((row.get("activation_rate") or 0) for row in rows) / total_leaders, 2) if total_leaders else 0
    avg_retention = round(sum((row.get("retention_rate") or 0) for row in rows) / total_leaders, 2) if total_leaders else 0

    return {
        "total_leaders": total_leaders,
        "total_reach": total_reach,
        "total_referrals": total_referrals,
        "avg_activation_rate": avg_activation,
        "avg_retention_rate": avg_retention,
    }

@router.get("/{leader_id}", response_model=KetuaArisan)
async def get_ketua_arisan(leader_id: str):
    if supabase is None:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    res = supabase.table("ketua_arisan").select("*").eq("id", leader_id).single().execute()
    if res is None or res.data is None:
        raise HTTPException(status_code=404, detail="Ketua Arisan not found")
    return KetuaArisan(**res.data).dict()

@router.put("/{leader_id}", response_model=KetuaArisan)
async def update_ketua_arisan(leader_id: str, record: KetuaArisanCreate):
    res = supabase.table("ketua_arisan").update(record.dict()).eq("id", leader_id).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to update Ketua Arisan profile")
    return KetuaArisan(**res.data[0]).dict()

@router.delete("/{leader_id}", status_code=204)
async def delete_ketua_arisan(leader_id: str):
    res = supabase.table("ketua_arisan").delete().eq("id", leader_id).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to delete Ketua Arisan profile")
    return

@router.get("/summary", response_model=dict)
async def ketua_arisan_summary():
    if supabase is None:
        return {
            "total_leaders": 0,
            "total_reach": 0,
            "total_referrals": 0,
            "avg_activation_rate": 0,
            "avg_retention_rate": 0,
        }
    res = supabase.table("ketua_arisan").select(
        "id, community_size, circles_created, members_referred, activation_rate, retention_rate"
    ).execute()
    if res.data is None:
        raise HTTPException(status_code=500, detail="Unable to load Ketua Arisan summary")

    rows = res.data or []
    total_leaders = len(rows)
    total_reach = sum((row.get("community_size") or 0) for row in rows)
    total_referrals = sum((row.get("members_referred") or 0) for row in rows)
    avg_activation = round(sum((row.get("activation_rate") or 0) for row in rows) / total_leaders, 2) if total_leaders else 0
    avg_retention = round(sum((row.get("retention_rate") or 0) for row in rows) / total_leaders, 2) if total_leaders else 0

    return {
        "total_leaders": total_leaders,
        "total_reach": total_reach,
        "total_referrals": total_referrals,
        "avg_activation_rate": avg_activation,
        "avg_retention_rate": avg_retention,
    }
