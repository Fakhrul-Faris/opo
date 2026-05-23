from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from supabase import create_client
import os

router = APIRouter()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE")
)

class ComplianceCheckBase(BaseModel):
    campaign_id: str
    requirement: str = Field(..., example="GDPR Data Privacy")
    status: str = Field(default="pending")  # pending, approved, rejected
    notes: str | None = None
    checked_by: str | None = None
    checked_at: str | None = None

class ComplianceCheckCreate(ComplianceCheckBase):
    pass

class ComplianceCheck(ComplianceCheckBase):
    id: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

@router.get("", response_model=list)
async def list_compliance_checks(campaign_id: str | None = None):
    query = supabase.table("compliance_checks").select("*")
    if campaign_id:
        query = query.eq("campaign_id", campaign_id)
    
    res = query.execute()
    if res.data is None:
        raise HTTPException(status_code=500, detail="Unable to load compliance checks")
    
    return [ComplianceCheck(**c).dict() for c in res.data or []]

@router.post("", response_model=ComplianceCheck)
async def create_compliance_check(check: ComplianceCheckCreate):
    res = supabase.table("compliance_checks").insert(check.dict()).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to create compliance check")
    
    return ComplianceCheck(**res.data[0]).dict()

@router.get("/{check_id}", response_model=ComplianceCheck)
async def get_compliance_check(check_id: str):
    res = supabase.table("compliance_checks").select("*").eq("id", check_id).single().execute()
    if res.data is None:
        raise HTTPException(status_code=404, detail="Check not found")
    
    return ComplianceCheck(**res.data).dict()

@router.put("/{check_id}", response_model=ComplianceCheck)
async def update_compliance_check(check_id: str, check: ComplianceCheckCreate):
    res = supabase.table("compliance_checks").update(check.dict()).eq("id", check_id).execute()
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to update compliance check")
    
    return ComplianceCheck(**res.data[0]).dict()

@router.delete("/{check_id}", status_code=204)
async def delete_compliance_check(check_id: str):
    supabase.table("compliance_checks").delete().eq("id", check_id).execute()

@router.post("/{check_id}/approve")
async def approve_compliance_check(check_id: str, reviewer: dict):
    res = supabase.table("compliance_checks").update({
        "status": "approved",
        "checked_by": reviewer.get("reviewer_id"),
        "checked_at": "now()"
    }).eq("id", check_id).execute()
    
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to approve compliance check")
    
    return {"status": "approved"}

@router.post("/{check_id}/reject")
async def reject_compliance_check(check_id: str, review: dict):
    res = supabase.table("compliance_checks").update({
        "status": "rejected",
        "notes": review.get("notes"),
        "checked_by": review.get("reviewer_id"),
        "checked_at": "now()"
    }).eq("id", check_id).execute()
    
    if res.data is None:
        raise HTTPException(status_code=400, detail="Unable to reject compliance check")
    
    return {"status": "rejected"}
