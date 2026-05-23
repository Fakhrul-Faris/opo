from __future__ import annotations

import os
from dotenv import load_dotenv
from supabase import create_client
import httpx

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE = os.getenv("SUPABASE_SERVICE_ROLE")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

DEFAULT_OPENAI_MODEL = "gpt-4o-mini"
DEFAULT_OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"
DEFAULT_CLAUDE_MODEL = "claude-3.5-neo"
DEFAULT_CLAUDE_EMBEDDING_MODEL = "claude-3.5-embedding"

async def get_ai_settings() -> dict:
    result = supabase.table("app_settings").select("*").eq("id", 1).maybe_single().execute()
    if result.error:
        raise RuntimeError("Unable to load AI settings from Supabase")
    if result.data:
        return result.data
    return {"ai_provider": "claude", "ai_api_key": os.getenv("AI_API_KEY", "")}

async def generate_text_completion(
    prompt: str,
    provider: str,
    api_key: str,
    model: str | None = None,
    temperature: float = 0.7,
    context: str | None = None,
) -> str:
    if provider == "openai":
        chosen_model = model or DEFAULT_OPENAI_MODEL
        payload = {
            "model": chosen_model,
            "messages": [
                {"role": "user", "content": prompt if not context else f"{context}\n\n{prompt}"}
            ],
            "temperature": temperature,
        }
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    if provider == "claude":
        chosen_model = model or DEFAULT_CLAUDE_MODEL
        prompt_text = f"\n\nHuman: {prompt}\n\nAssistant:"
        if context:
            prompt_text = f"\n\nHuman: {context}\n\n{prompt_text}"
        payload = {
            "model": chosen_model,
            "prompt": prompt_text,
            "max_tokens_to_sample": 1200,
            "temperature": temperature,
        }
        url = "https://api.anthropic.com/v1/complete"
        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get("completion", "").strip()

    raise RuntimeError(f"Unsupported AI provider: {provider}")

async def generate_embeddings(
    inputs: list[str],
    provider: str,
    api_key: str,
    model: str | None = None,
) -> list[list[float]]:
    if provider == "openai":
        chosen_model = model or DEFAULT_OPENAI_EMBEDDING_MODEL
        payload = {"model": chosen_model, "input": inputs}
        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return [item["embedding"] for item in data.get("data", [])]

    if provider == "claude":
        chosen_model = model or DEFAULT_CLAUDE_EMBEDDING_MODEL
        payload = {"model": chosen_model, "input": inputs}
        url = "https://api.anthropic.com/v1/embeddings"
        headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return [item["embedding"] for item in data.get("data", [])]

    raise RuntimeError(f"Unsupported AI provider for embeddings: {provider}")
