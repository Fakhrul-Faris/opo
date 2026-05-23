# Opo Release Notes (Dev) — 2026-05-23

## What’s included
- Existing core modules + advanced Phase 2/3 pages are wired in the frontend routing.
- Backend routers are included under:
  - `/campaigns`, `/content`, `/referrals`, `/ketua_arisan`, `/auth`, `/settings`, `/ai`, `/compliance`
- Frontend test coverage (Vitest/RTL) is passing.
- Backend test coverage (pytest) is passing.

## Verification performed
### Frontend
- `npm test` in `frontend/`: **PASS** (9/9 tests in suite shown)
- `npm run build` in `frontend/`: **PASS** (Vite production build completed successfully)

### Backend
- `pytest` in `backend/`: **PASS** (11 passed)

### Notes on warnings (non-blocking)
- A number of Pydantic v2 deprecation warnings are emitted from router models.
- Supabase client deprecation warnings (timeout/verify parameter) are emitted during tests.

## Known gaps / next hardening items
- Manual QA + Lighthouse audit: **in progress** (see below)
- Accessibility checks and error handling validation: **not yet executed**
- Final hand-off doc: **in progress**

## TODO (from repo TODO.md)
- [x] Run manual QA + Lighthouse performance audit
- [ ] Conduct accessibility checks and error handling validation
- [ ] Document final release and project hand-off notes

