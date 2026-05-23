from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .ai_utils import get_ai_settings, generate_text_completion, generate_embeddings

router = APIRouter()

class AIExecuteRequest(BaseModel):
    prompt: str
    provider: str | None = None
    model: str | None = None
    temperature: float = 0.7
    context: str | None = None

class AIExecuteResponse(BaseModel):
    provider: str
    model: str
    output: str

class EmbeddingsRequest(BaseModel):
    texts: list[str]
    provider: str | None = None
    model: str | None = None

class EmbeddingsResponse(BaseModel):
    provider: str
    model: str
    embeddings: list[list[float]]

@router.post("/execute", response_model=AIExecuteResponse)
async def execute_ai(request: AIExecuteRequest):
    settings = await get_ai_settings()
    provider = request.provider or settings.get("ai_provider", "claude")
    api_key = settings.get("ai_api_key")

    if not api_key:
        raise HTTPException(status_code=400, detail="AI API key is not configured")

    try:
        output = await generate_text_completion(
            prompt=request.prompt,
            provider=provider,
            api_key=api_key,
            model=request.model,
            temperature=request.temperature,
            context=request.context,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return AIExecuteResponse(provider=provider, model=request.model or "default", output=output)

@router.post("/embeddings", response_model=EmbeddingsResponse)
async def embeddings(request: EmbeddingsRequest):
    settings = await get_ai_settings()
    provider = request.provider or settings.get("ai_provider", "claude")
    api_key = settings.get("ai_api_key")

    if not api_key:
        raise HTTPException(status_code=400, detail="AI API key is not configured")

    try:
        vectors = await generate_embeddings(request.texts, provider, api_key, model=request.model)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return EmbeddingsResponse(provider=provider, model=request.model or "default", embeddings=vectors)
