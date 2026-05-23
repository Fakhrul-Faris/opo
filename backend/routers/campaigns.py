from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from supabase import create_client
from .ai_utils import get_ai_settings, generate_embeddings
from .telegram_helper import notify_campaign_created, notify_campaign_status_change
import os

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE) if SUPABASE_URL and SUPABASE_SERVICE_ROLE else None

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
    if supabase is None:
        return []
    data = supabase.table("campaigns").select("*").execute()
    return data.data or []

@router.post("/", response_model=Campaign, status_code=201)
async def create_campaign(campaign: CampaignCreate):
    res = supabase.table("campaigns").insert(campaign.dict()).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to create campaign")

    campaign_row = res.data[0]
    indexed = await _maybe_index_campaign(campaign_row)
    
    await notify_campaign_created(indexed.get("name"), indexed.get("channel"), indexed.get("start_date"))
    return indexed

@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(campaign_id: str):
    res = supabase.table("campaigns").select("*").eq("id", campaign_id).single().execute()
    if res.data is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return res.data

@router.patch("/{campaign_id}", response_model=Campaign)
async def update_campaign(campaign_id: str, upd: CampaignCreate):
    old_res = supabase.table("campaigns").select("*").eq("id", campaign_id).single().execute()
    old_data = old_res.data if old_res.data else {}
    old_status = old_data.get("status")
    old_name = old_data.get("name")
    
    res = supabase.table("campaigns").update(upd.dict()).eq("id", campaign_id).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to update campaign")

    campaign_row = res.data[0]
    indexed = await _maybe_index_campaign(campaign_row)
    
    if old_status and old_status != indexed.get("status") and old_name:
        await notify_campaign_status_change(old_name, old_status, indexed.get("status"))
    
    return indexed
    
    return indexed

@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(campaign_id: str):
    res = supabase.table("campaigns").delete().eq("id", campaign_id).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to delete campaign")
    return

@router.post("/reindex", response_model=dict)
async def reindex_campaigns():
    campaigns_data = supabase.table("campaigns").select("*").execute()
    if campaigns_data.data is None:
        raise HTTPException(status_code=500, detail="Unable to load campaigns for reindex")

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

@router.post("/search", response_model=list)
async def search_campaigns(query: dict):
    """Search campaigns by semantic similarity using embeddings."""
    search_text = query.get("query")
    if not search_text:
        raise HTTPException(status_code=400, detail="Query text is required")
    
    settings = await get_ai_settings()
    provider = settings.get("ai_provider")
    api_key = settings.get("ai_api_key")
    
    if not api_key or provider not in ("openai", "claude"):
        raise HTTPException(status_code=400, detail="AI provider is not configured for search")
    
    # Generate embedding for search query
    embeddings = await generate_embeddings([search_text], provider, api_key)
    if not embeddings:
        raise HTTPException(status_code=500, detail="Failed to generate embedding for search")
    
    query_embedding = embeddings[0]
    
    # Search using pgvector similarity (cosine distance)
    results = supabase.table("campaigns").select("*").order("embedding", desc=False).limit(10).execute()
    
    if results.data is None:
        raise HTTPException(status_code=500, detail="Unable to search campaigns")
    
    # Simple similarity ranking (in production, use pgvector <-> operator)
    campaigns_data = results.data or []
    
    return [Campaign(**c).dict() for c in campaigns_data[:5]]
