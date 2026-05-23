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

class ContentAssetBase(BaseModel):
    title: str
    type: str
    platform: str
    theme: str
    body: str
    campaign_id: str | None = None
    status: str = "draft"
    source: str
    published_date: str | None = None

class ContentAssetCreate(ContentAssetBase):
    pass

class ContentAsset(ContentAssetBase):
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

async def _build_content_embedding_text(asset: dict) -> str:
    return " | ".join(
        str(value)
        for value in [
            asset.get("title"),
            asset.get("type"),
            asset.get("platform"),
            asset.get("theme"),
            asset.get("body"),
            asset.get("source"),
            asset.get("status"),
        ]
        if value
    )

async def _maybe_index_content(asset: dict) -> dict:
    settings = await get_ai_settings()
    provider = settings.get("ai_provider")
    api_key = settings.get("ai_api_key")
    if not api_key or provider not in ("openai", "claude"):
        return asset

    text = await _build_content_embedding_text(asset)
    if not text:
        return asset

    embeddings = await generate_embeddings([text], provider, api_key)
    if not embeddings:
        return asset

    supabase.table("content_assets").update({"embedding": embeddings[0]}).eq("id", asset["id"]).execute()
    asset["embedding"] = embeddings[0]
    return asset

@router.get("/", response_model=list[ContentAsset])
async def list_content():
    res = supabase.table("content_assets").select("*").execute()
    return res.data

@router.post("/", response_model=ContentAsset, status_code=201)
async def create_content(asset: ContentAssetCreate):
    res = supabase.table("content_assets").insert(asset.model_dump()).execute()
    asset_row = res.data[0]
    return await _maybe_index_content(asset_row)

@router.get("/{asset_id}", response_model=ContentAsset)
async def get_content(asset_id: str):
    res = supabase.table("content_assets").select("*").eq("id", asset_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Content asset not found")
    return res.data

@router.patch("/{asset_id}", response_model=ContentAsset)
async def update_content(asset_id: str, upd: ContentAssetCreate):
    res = supabase.table("content_assets").update(upd.model_dump()).eq("id", asset_id).execute()
    asset_row = res.data[0]
    return await _maybe_index_content(asset_row)

@router.delete("/{asset_id}", status_code=204)
async def delete_content(asset_id: str):
    supabase.table("content_assets").delete().eq("id", asset_id).execute()

@router.post("/reindex", response_model=dict)
async def reindex_content():
    assets_data = supabase.table("content_assets").select("*").execute()
    if assets_data.error:
        raise HTTPException(status_code=500, detail=assets_data.error.message)

    settings = await get_ai_settings()
    provider = settings.get("ai_provider")
    api_key = settings.get("ai_api_key")
    if not api_key or provider not in ("openai", "claude"):
        raise HTTPException(status_code=400, detail="AI provider is not configured for embeddings")

    updated = 0
    for asset in assets_data.data or []:
        text = await _build_content_embedding_text(asset)
        if not text:
            continue
        embeddings = await generate_embeddings([text], provider, api_key)
        if embeddings:
            supabase.table("content_assets").update({"embedding": embeddings[0]}).eq("id", asset["id"]).execute()
            updated += 1

    return {"reindexed": updated}
