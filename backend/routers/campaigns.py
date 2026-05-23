from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from supabase import create_client
from .ai_utils import get_ai_settings, generate_embeddings
import os

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

class CampaignBase(BaseModel):
    name: str = Field(..., example="Q1 Launch")
    objective: str = Field(..., example="App download")
    channel: str = Field(..., example="TikTok")
    status: str = Field(default="draft")
    start_date: str = Field(..., example="2026-06-01")
    end_date: str | None = None
    budget: float | None = None
    compliance_dependent: bool = False
    ai_indexed: bool = False

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

async def _build_campaign_embedding_text(campaign: dict) -> str:
    return " | ".join(
        str(value)
        for value in [
            campaign.get("name"),
            campaign.get("objective"),
            campaign.get("channel"),
            campaign.get("status"),
            campaign.get("start_date"),
            campaign.get("end_date"),
            campaign.get("budget"),
        ]
        if value
    )

async def _maybe_index_campaign(campaign: dict) -> dict:
    if not campaign.get("ai_indexed"):
        return campaign

    settings = await get_ai_settings()
    provider = settings.get("ai_provider")
    api_key = settings.get("ai_api_key")
    if not api_key or provider not in ("openai", "claude"):
        return campaign

    text = await _build_campaign_embedding_text(campaign)
    if not text:
        return campaign

    embeddings = await generate_embeddings([text], provider, api_key)
    if not embeddings:
        return campaign

    supabase.table("campaigns").update({"embedding": embeddings[0]}).eq("id", campaign["id"]).execute()
    campaign["embedding"] = embeddings[0]
    return campaign

@router.get("/", response_model=list[Campaign])
async def list_campaigns():
    data = supabase.table("campaigns").select("*").execute()
    return data.data

@router.post("/", response_model=Campaign, status_code=201)
async def create_campaign(campaign: CampaignCreate):
    res = supabase.table("campaigns").insert(campaign.dict()).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)

    campaign_row = res.data[0]
    return await _maybe_index_campaign(campaign_row)

@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str):
    res = supabase.table("campaigns").select("*").eq("id", campaign_id).single().execute()
    if res.error:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return res.data

@router.patch("/{campaign_id}", response_model=Campaign)
async def update_campaign(campaign_id: str, upd: CampaignCreate):
    res = supabase.table("campaigns").update(upd.dict()).eq("id", campaign_id).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)

    campaign_row = res.data[0]
    return await _maybe_index_campaign(campaign_row)

@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(campaign_id: str):
    res = supabase.table("campaigns").delete().eq("id", campaign_id).execute()
    if res.error:
        raise HTTPException(status_code=400, detail=res.error.message)
    return

@router.post("/reindex", response_model=dict)
async def reindex_campaigns():
    campaigns_data = supabase.table("campaigns").select("*").execute()
    if campaigns_data.error:
        raise HTTPException(status_code=500, detail=campaigns_data.error.message)

    settings = await get_ai_settings()
    provider = settings.get("ai_provider")
    api_key = settings.get("ai_api_key")
    if not api_key or provider not in ("openai", "claude"):
        raise HTTPException(status_code=400, detail="AI provider is not configured for embeddings")

    updated = 0
    for campaign in campaigns_data.data or []:
        if not campaign.get("ai_indexed"):
            continue
        text = await _build_campaign_embedding_text(campaign)
        if not text:
            continue
        embeddings = await generate_embeddings([text], provider, api_key)
        if embeddings:
            supabase.table("campaigns").update({"embedding": embeddings[0]}).eq("id", campaign["id"]).execute()
            updated += 1

    return {"reindexed": updated}
