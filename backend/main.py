from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from routers import campaigns, content, referrals, auth, settings, ai, compliance, ketua_arisan

app = FastAPI(title="Opo Marketing Portal Backend")

# Include routers
app.include_router(campaigns.router, prefix="/campaigns", tags=["Campaigns"])
app.include_router(content.router, prefix="/content", tags=["Content Assets"])
app.include_router(referrals.router, prefix="/referrals", tags=["Referral Tracker"])
app.include_router(ketua_arisan.router, prefix="/ketua_arisan", tags=["Community Intelligence"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(settings.router, prefix="/settings", tags=["Settings"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])
app.include_router(compliance.router, prefix="/compliance", tags=["Compliance"])

# Health‑check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
