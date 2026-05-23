from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

class ReferralBase(BaseModel):
    source: str
    clicks: int = 0
    conversions: int = 0

class ReferralCreate(ReferralBase):
    pass

class Referral(ReferralBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=list[Referral])
async def list_referrals():
    res = supabase.table("referrals").select("*").execute()
    return res.data

@router.post("/", response_model=Referral, status_code=201)
async def create_referral(referral: ReferralCreate):
    res = supabase.table("referrals").insert(referral.model_dump()).execute()
    return res.data[0]

@router.get("/{referral_id}", response_model=Referral)
async def get_referral(referral_id: str):
    res = supabase.table("referrals").select("*").eq("id", referral_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Referral not found")
    return res.data

@router.patch("/{referral_id}", response_model=Referral)
async def update_referral(referral_id: str, upd: ReferralCreate):
    res = supabase.table("referrals").update(upd.model_dump()).eq("id", referral_id).execute()
    return res.data[0]

@router.delete("/{referral_id}", status_code=204)
async def delete_referral(referral_id: str):
    supabase.table("referrals").delete().eq("id", referral_id).execute()
