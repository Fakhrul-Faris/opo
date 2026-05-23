# Opo — Release & Handoff (Dev) 2026-05-23

## Status
- Backend: tests ✅
- Frontend: tests ✅
- Manual QA/Lighthouse: ✅ (executed; see `RELEASE_NOTES.md`)
- Accessibility + error handling validation: ✅ (manual pass)

## How to run locally

### 1) Environment setup
- Copy env vars into `/Users/mac/Fleap/Opo/opo/.env` (already referenced via `python-dotenv`).
- Ensure you have a Supabase URL + service role key (or configured test credentials) for backend.

### 2) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r pyproject.toml  # if you use requirements; otherwise use uv/pip per your workflow
pytest -q
uvicorn main:app --reload --port 8000
```

### 3) Frontend
```bash
cd frontend
npm install
npm test
npm run dev
```

## Test commands
- Backend: `cd backend && pytest -q`
- Frontend: `cd frontend && npm test`

## Verification notes
- `frontend/npm test` passes.
- `backend/pytest` passes.
- Warnings observed during backend tests:
  - Pydantic v2 deprecation warnings (`Field(example=...)`, class-based config).
  - Supabase client deprecation warnings around http client `timeout` / `verify` args.
  - These are non-blocking for current release.

## Known issues / follow-ups (non-blocking)
- Consider migrating Pydantic model field metadata to `json_schema_extra` and `ConfigDict` to reduce warnings.
- Supabase client config deprecations should be updated when dependencies bump.

## Handoff checklist (final)
- [x] Confirm local run instructions.
- [x] Confirm `RELEASE_NOTES.md` content.
- [x] Confirm test commands.

