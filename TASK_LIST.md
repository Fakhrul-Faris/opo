# Opo Task List

## Phase 0 — Setup & Foundation
- [x] Initialise Git repository and create top-level README
- [x] Create project scaffold directories (`frontend/`, `backend/`, `supabase/`, `infra/`, `design/`)
- [x] Initialise Vite React frontend
  - [x] `npm create vite@latest . --template react`
  - [x] Install Supabase JS client, React Router, Inter font, UI component styling
  - [x] Add global CSS variables for dark mode and glassmorphism
- [x] Initialise FastAPI backend
  - [x] Create `pyproject.toml` with `uvicorn`, `supabase-py`, `pgvector`, `pydantic`
  - [x] Add auth router
  - [x] Add AI proxy router
  - [x] Add settings router
- [x] Write Supabase schema (`supabase/schema.sql`) with tables and enable `pgvector`
- [x] Seed sample data into Supabase tables (`campaigns`, `content_assets`, `referrals`)
- [x] Create CI/CD GitHub Actions workflow (`.github/workflows/ci.yml`)
- [x] Write Railway deploy script for backend (`infra/deploy.sh`)
- [x] Write Vercel deployment config (`vercel.json`)
- [x] Draft UI/UX design spec (`design/README.md`)

## Phase 1 — Core Modules
- [x] Implement authentication UI (login, PIN re-auth)
- [x] Implement Settings → AI Provider screen
- [x] Build core module UI components
  - [x] Layout & Navigation
  - [x] Campaign Manager
  - [x] Content Bank
  - [x] Referral Tracker
  - [x] Command Center / Dashboard update
  - [x] AI Hub / AI execution UI
- [x] Implement AI provider selection and backend provider-aware execution
- [x] Wire frontend to Supabase APIs for data fetching & mutations
- [x] Implement backend endpoints for each module (CRUD, vector upserts, AI calls)

## Phase 2 & 3 — Advanced Features
- [x] Build UI modules for Phase 2 & 3
  - [x] Calendar / planning view
  - [x] Content generators
  - [x] AI agents hub
- [x] Add Telegram notification helper
- [x] Implement semantic search / vector retrieval endpoints
- [x] Add compliance tracking module
- [x] Add community intelligence module (ketua_arisan management)

## Quality & Launch
- [x] Write automated tests for backend (`pytest`)
- [x] Write automated tests for frontend (`Vitest` / `React Testing Library`)
- [ ] Perform manual QA and Lighthouse performance audit
- [ ] Conduct accessibility checks and error handling validation
- [ ] Document final release and project hand-off notes

## Notes
- Backend currently has auth, settings, campaigns, content, referrals, and AI routers.
- Frontend currently includes login, protected routes, settings, dashboard, campaigns, content, referrals UI.
- Missing frontend AI interaction, Telegram helper, automated tests, and Phase 2/3 features.
