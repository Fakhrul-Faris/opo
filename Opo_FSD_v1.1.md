# Opo — Functional Specification Document
**Product:** Opo Marketing Portal
**Client:** Fleap
**Version:** 1.1
**Status:** Draft — Pending Review
**Date:** 23 May 2026
**Author:** Fakhrul

> **v1.1 Changes:** Rebranded from Flee to Fleap. Shifted market context from Malaysia (BNM) to Indonesia (OJK). All modules updated to reflect Fleap's business nature as a digital Arisan platform. Campaign objectives, community listening, competitor intelligence, referral tracking, and growth phases are now Fleap-specific. Ketua Arisan Program added to Referral Tracker. Compliance status folded into Command Center as a dedicated widget. WhatsApp integration removed.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Product Goals](#2-product-goals)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [User & Auth](#5-user--auth)
6. [Module Specifications](#6-module-specifications)
   - [M01 — Command Center](#m01--command-center)
   - [M02 — Campaign Manager](#m02--campaign-manager)
   - [M03 — Content Bank](#m03--content-bank)
   - [M04 — Content Calendar](#m04--content-calendar)
   - [M05 — Content Generator](#m05--content-generator)
   - [M06 — Channel Monitor](#m06--channel-monitor)
   - [M07 — Community Listening Feed](#m07--community-listening-feed)
   - [M08 — Competitor Intelligence Board](#m08--competitor-intelligence-board)
   - [M09 — Referral & Ketua Arisan Tracker](#m09--referral--ketua-arisan-tracker)
   - [M10 — Experiment Log](#m10--experiment-log)
   - [M11 — Growth Phase Tracker](#m11--growth-phase-tracker)
   - [M12 — AI Agent Hub](#m12--ai-agent-hub)
   - [M13 — Notification Center](#m13--notification-center)
7. [Data Models](#7-data-models)
8. [Integration Specifications](#8-integration-specifications)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Out of Scope](#10-out-of-scope)
11. [Phased Delivery](#11-phased-delivery)

---

## 1. Overview

**Opo** is a single-user AI-powered marketing operations portal built for Fleap — a digital Arisan (rotating savings) platform targeting the Indonesian market. Opo serves as Fleap's central growth and marketing operating system, covering campaign management, content operations, channel monitoring, community intelligence, regulatory compliance visibility, and an embedded AI agent capable of analysis, decision-making, and brainstorming.

Opo is purpose-built for Fleap's specific context: a regulated fintech product operating in Indonesia's social finance space, scaling organically from OJK Sandbox beta to commercial launch. Every module reflects Fleap's business nature, competitive landscape, and cultural market requirements.

**Fleap product context:**
- Digital Arisan platform with wallet-based system, rank mechanics, and escrow protection
- Indonesia market, OJK Regulatory Sandbox path
- Primary acquisition channels: community leaders (Ketua Arisan), TikTok, Threads, Reddit
- Goal: drive app downloads, circle creation, and active user participation in Arisan cycles

---

## 2. Product Goals

| Goal | Description |
|---|---|
| Centralize marketing operations | One portal for all Fleap marketing activity — no switching between disconnected tools |
| Track Arisan-specific metrics | Every metric is tied to Fleap's actual growth levers: downloads, circles, activations, Ketua Arisan performance |
| Surface compliance status | OJK and PSE registration milestones are visible at all times — compliance blocks marketing |
| Enable AI-assisted decisions | The AI agent has full context of Fleap's strategy, regulatory environment, and competitive landscape |
| Keep costs minimal | Infrastructure and operational cost must remain under $30/month |
| Enable solo operation | The founder runs the full marketing department from Opo without a team |

---

## 3. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React | Component-based, suited for a multi-module portal |
| Backend | Python / FastAPI | Lightweight, compatible with AI/ML libraries |
| Database | Supabase (PostgreSQL + pgvector) | Handles structured data and semantic vector search in one system |
| Auth | Supabase Auth | Built-in, eliminates custom JWT implementation |
| AI / LLM | Claude Sonnet (Anthropic API) | Best-in-class reasoning for decision and brainstorm tasks |
| Notifications | Telegram Bot API | Lightweight push, founder-preferred channel |
| Scraping / Scheduling | Python APScheduler + Playwright | On-demand scrape triggers, headless browser for community platforms |
| Hosting | Hetzner VPS (€6/mo) or Railway | Low-cost, sufficient for single-user load |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│         (13 modules, single-user portal)         │
└───────────────────┬─────────────────────────────┘
                    │ REST / WebSocket
┌───────────────────▼─────────────────────────────┐
│              FastAPI Backend                     │
│   Route handlers · Agent orchestration layer     │
│   Scrape trigger · Telegram dispatch             │
└──────┬────────────────────┬──────────────────────┘
       │                    │
┌──────▼──────┐    ┌────────▼────────┐
│  Supabase   │    │  Claude Sonnet  │
│  Postgres   │    │  API (Anthropic)│
│  pgvector   │    └─────────────────┘
│  Auth       │
└─────────────┘
       │
┌──────▼──────────────────────────────────────────┐
│           External Integrations                  │
│  TikTok API · Reddit API · Threads (scrape)      │
│  Telegram Bot API                                │
└─────────────────────────────────────────────────┘
```

---

## 5. User & Auth

Opo is a single-user application. There is no team management, role system, or multi-account support in v1.

### 5.1 Authentication Flow

| Step | Behavior |
|---|---|
| Login | Email + password via Supabase Auth |
| Session | JWT token stored in `httpOnly` cookie, 7-day expiry |
| Re-auth | PIN screen (4-digit) for re-access within active session |
| Logout | Clears session token, redirects to login |
| Password reset | Email-based via Supabase Auth |

### 5.2 Functional Requirements

- `FR-AUTH-01` — User must authenticate before accessing any portal module
- `FR-AUTH-02` — Sessions expire after 7 days of inactivity
- `FR-AUTH-03` — Failed login attempts are rate-limited (5 attempts, 15-minute lockout)
- `FR-AUTH-04` — All API routes are protected via session token validation

---

## 6. Module Specifications

---

### M01 — Command Center

**Purpose:** The default landing screen after login. Provides a real-time pulse of Fleap's growth and compliance state — surfacing only what matters right now.

**Core Features:**

**Growth KPI Widget**
- Current growth phase indicator (Phase 1 / 2 / 3) with active user count
- 5 live KPI cards: active campaigns, app downloads this week, active Arisan circles, Ketua Arisan active count, content published this week
- All KPI cards clickable, navigating to their respective module

**Compliance Status Widget**
- OJK Regulatory Sandbox status (Pending / Active / Approved / Flagged)
- PSE Asing registration status
- eKYC provider (Digisign/Privy) integration health
- Next compliance action item with due date
- Compliance alerts surface here first before Telegram notification

**Operations Widget**
- AI agent quick-launch with mode selector (Analyst / Decision / Brainstorm)
- Unread notification badge with inline preview of latest 3 alerts
- Upcoming content calendar items (next 3 scheduled posts)
- Last AI decision summary with timestamp

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M01-01 | All KPI cards pull live data from Supabase on page load |
| FR-M01-02 | Growth phase indicator updates automatically when active user count crosses a phase threshold |
| FR-M01-03 | Compliance widget displays a status badge per item: green (clear), amber (action needed), red (blocked) |
| FR-M01-04 | A red compliance status disables campaign creation and surfaces a blocking alert |
| FR-M01-05 | AI quick-launch opens the AI Agent Hub with the selected mode pre-activated |
| FR-M01-06 | Compliance items are manually updated by the user — no automated compliance verification |

**UI Notes:** Three-widget layout. Compliance widget positioned prominently — it is a growth blocker when red and should never be buried.

---

### M02 — Campaign Manager

**Purpose:** Full lifecycle management for every marketing campaign Fleap runs. Objectives are scoped to Fleap's actual acquisition goals — not generic marketing outcomes. Published campaigns are permanently stored for the AI to reference.

**Core Features:**

- Campaign creation with Fleap-specific objective types
- Status pipeline: Draft → Active → Paused → Completed
- Campaign detail view with linked content assets, channel, metrics, and post-mortem
- Archive view — all completed campaigns, searchable and filterable
- AI reference flag — campaigns marked as AI-indexed are embedded in pgvector for agent retrieval
- Bulk status update

**Fleap Campaign Objective Types:**

| Objective | Description |
|---|---|
| App download | Drive installs of the Fleap app |
| Circle creation | Activate users to start their own Arisan group |
| Circle join | Drive users to join an existing Arisan circle |
| Ketua Arisan activation | Recruit a community leader to bring in a group |
| OJK beta sign-up | Collect registrations during OJK sandbox beta period |
| Brand awareness | Build Fleap recognition and trust in target communities |

**Campaign Data Structure:**

| Field | Type | Notes |
|---|---|---|
| Name | String | Campaign name |
| Objective | Enum | From Fleap objective types above |
| Channel | Enum | TikTok / Threads / Reddit / Multi |
| Status | Enum | Draft / Active / Paused / Completed |
| Start date | Date | — |
| End date | Date | Optional for ongoing |
| Budget | Number | Can be 0 for organic |
| Content assets | Array | Linked from Content Bank |
| Target metric | String | e.g. "200 app downloads" |
| Actual metric | String | Filled on completion |
| Compliance dependency | Boolean | Flag if campaign requires active OJK sandbox status |
| Notes | Text | Freeform post-mortem |
| AI indexed | Boolean | Whether AI agent can retrieve this campaign |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M02-01 | Campaign creation requires minimum: name, objective, channel, start date |
| FR-M02-02 | Campaigns flagged as compliance-dependent cannot be activated when OJK status is red |
| FR-M02-03 | Status transitions are logged with timestamp |
| FR-M02-04 | Completed campaigns automatically prompt the user to fill in actual metrics and post-mortem notes |
| FR-M02-05 | AI-indexed campaigns are stored as vector embeddings in pgvector for semantic retrieval |
| FR-M02-06 | Campaign archive is searchable by name, channel, objective, and date range |
| FR-M02-07 | Deleting a campaign requires confirmation — soft delete only, data retained |

---

### M03 — Content Bank

**Purpose:** Central repository for all Fleap content assets. Every asset has its own metric card and is linked to its originating campaign and platform. The AI references this bank during content generation and performance analysis.

**Core Features:**

- Asset creation (text, captions, scripts, hooks, thread series, Reddit posts)
- Asset metric card: views, engagement rate, shares, saves, conversion attribution (downloads, circle sign-ups)
- Platform tag: TikTok / Threads / Reddit
- Content theme tag: Arisan education / Trust building / Success story / Feature explainer / Cultural / Founder story
- Performance tier auto-tagging: Top / Average / Underperforming
- Link to parent campaign
- "Used vs Generated" flag — tracks if AI-generated content was actually published
- Search and filter by platform, theme, campaign, performance tier, date

**Content Asset Data Structure:**

| Field | Type | Notes |
|---|---|---|
| Title | String | Internal reference name |
| Type | Enum | Hook / Caption / Script / Thread / Reddit post |
| Platform | Enum | TikTok / Threads / Reddit |
| Theme | Enum | Arisan education / Trust building / Success story / Feature explainer / Cultural / Founder story |
| Body | Text | The content itself |
| Campaign | FK | Linked campaign (optional) |
| Status | Enum | Draft / Scheduled / Published / Archived |
| Source | Enum | Manual / AI-generated |
| Published date | Date | — |
| Views | Number | Pulled from platform API or manual |
| Engagement rate | Float | Calculated field |
| Shares | Number | — |
| Saves | Number | — |
| Download attribution | Number | App downloads attributed to this asset |
| Circle attribution | Number | Circle sign-ups attributed to this asset |
| Performance tier | Enum | Auto-calculated: Top / Average / Underperforming |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M03-01 | Every published asset must have a platform tag and a theme tag |
| FR-M03-02 | Performance tier is auto-calculated based on configurable engagement benchmarks per platform |
| FR-M03-03 | AI-generated assets are flagged with source = AI-generated |
| FR-M03-04 | Assets are stored as vector embeddings in pgvector so the AI can retrieve semantically similar content |
| FR-M03-05 | Metrics are updatable manually or via platform API sync |
| FR-M03-06 | Archived assets are excluded from AI retrieval by default unless explicitly included |

---

### M04 — Content Calendar

**Purpose:** Visual scheduling layer tied to the Content Bank and Campaign Manager. Provides weekly and monthly views of scheduled, published, and missing content.

**Core Features:**

- Monthly and weekly calendar views
- Each slot shows: platform icon, content theme tag, content title, status badge
- Draft, Scheduled, Published, and Missed states
- Gap detection — highlights empty slots during active campaign periods
- Click-to-schedule from Content Bank
- Quick-create from calendar slot (opens Content Generator pre-filled with date and platform)
- Drag-and-drop rescheduling

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M04-01 | Calendar displays all assets with a scheduled or published date |
| FR-M04-02 | Gap detection highlights empty slots during active campaign periods |
| FR-M04-03 | Clicking an empty slot opens the Content Generator with platform and date pre-filled |
| FR-M04-04 | Published date is auto-set when asset status changes to Published |
| FR-M04-05 | Missed status is auto-applied to scheduled assets past their date with no published confirmation |
| FR-M04-06 | Calendar integrates with Notification Center to alert on upcoming scheduled posts |

---

### M05 — Content Generator

**Purpose:** AI-powered text content generation scoped to three platforms — TikTok, Threads, and Reddit — with Fleap's brand voice, Arisan cultural context, Indonesia localization, and trust-building strategy baked into every output.

**Core Features:**

- Platform selector: TikTok / Threads / Reddit
- Theme selector: Arisan education / Trust building / Success story / Feature explainer / Cultural / Founder story
- Topic / prompt input
- Generation history with used/unused flag
- Direct "Save to Content Bank" action
- Regenerate with variation controls

**Platform-Specific Output Types:**

| Platform | Content Types | Strategic Role |
|---|---|---|
| TikTok | Hook (first 3 seconds) · Full video script · Caption · CTA | Primary acquisition channel for young working Indonesians. Education-first, trust-building content. |
| Threads | Short take · Thread series (5-part) · Reply hook | Organic growth channel. Financial literacy framing, gotong royong positioning, community saving narratives. |
| Reddit | Community post (long-form) · Comment reply · Question post | Behavioral research + authority building in Indonesian personal finance communities (r/finansial, r/indonesia). |

**Generator System Prompt Context (injected into every generation):**

Every generation request is pre-loaded with:

- **Fleap product context:** Digital Arisan platform, wallet-based system, rank mechanics (0–3+), escrow protection, lock-after-payout mechanic, no-default guarantee
- **Brand voice:** Trustworthy, community-first, culturally grounded, never corporate. Fleap exists because Arisan is already part of Indonesian life — the product makes it safer and fairer.
- **Indonesia localization:** Bahasa-native tone, gotong royong framing, cultural sensitivity, reference to Arisan as a community institution not just a savings tool
- **Platform behavior rules:** Per-platform content norms for Indonesian audiences
- **Active campaign context:** If linked to a campaign, objective and target audience are injected
- **Top-performing asset examples:** Retrieved from Content Bank via pgvector similarity search

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M05-01 | Platform and theme must be selected before generation |
| FR-M05-02 | All generated content is auto-saved to generation history |
| FR-M05-03 | User must explicitly "Save to Content Bank" — generation and publishing are separate actions |
| FR-M05-04 | Generator pulls top-performing content from Content Bank as style reference via pgvector |
| FR-M05-05 | Every generation logs: prompt, platform, theme, content type, timestamp, used flag |
| FR-M05-06 | Regenerate preserves the original prompt but varies tone, structure, or hook approach |
| FR-M05-07 | Generated content can be linked to a campaign at save time |

---

### M06 — Channel Monitor

**Purpose:** Per-channel health view for Fleap's three active platforms. Surfaces performance trends, flags underperforming channels, and feeds the AI agent with contextual signal during analysis sessions.

**Monitored Channels:** TikTok · Threads · Reddit

**Core Features per Channel:**

- Follower / subscriber growth chart (weekly)
- Engagement rate trend (last 30 days)
- Top performing post this period (linked to Content Bank)
- Channel health score (engagement + growth rate + posting consistency)
- Last updated timestamp
- Manual metric input fallback

**Channel Health Score Logic:**

```
Health Score (0–100) =
  (engagement_rate_vs_benchmark × 40) +
  (follower_growth_rate × 30) +
  (posting_consistency_score × 30)
```

Benchmarks are configurable per platform.

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M06-01 | Each channel has its own dedicated view with the above components |
| FR-M06-02 | Metrics update via platform API where available; manual input available as fallback |
| FR-M06-03 | Channel health score updates on each data refresh |
| FR-M06-04 | Health score below 40 triggers a notification |
| FR-M06-05 | Channel data is readable by the AI agent during Analyst mode sessions |
| FR-M06-06 | A "Sync Now" button triggers a manual data pull from connected platform APIs |

---

### M07 — Community Listening Feed

**Purpose:** On-demand signal aggregation from Indonesian online communities relevant to Fleap's market — Arisan behavior, fintech adoption sentiment, savings culture, and trust signals. Single-trigger action, not a background job.

**Monitored Sources:**

| Source | What We're Listening For |
|---|---|
| Reddit (r/finansial, r/indonesia, r/investasi) | Savings behavior, fintech trust, Arisan discussions, competitor mentions |
| TikTok comments (competitor and related content) | Arisan pain points, user sentiment, objections to digital savings |
| Threads | Fintech conversations, gotong royong framing, savings culture takes |

**Core Features:**

- "Run Analysis" button — triggers scrape + AI analysis pipeline
- Source selector — choose which platforms to include per run
- Results view: sentiment summary, top themes, Arisan-specific signals, trust barriers, opportunity gaps
- Historical analysis archive — every past run stored with date and findings
- Tag and save specific insights for later reference
- AI auto-generates a structured report after each run

**Scrape Pipeline (on-demand):**

```
User clicks "Run Analysis"
  → Backend triggers Playwright scraper for selected sources
  → Raw data collected and stored temporarily
  → Claude Sonnet processes raw data with Fleap context injected
  → Generates structured Fleap-specific report
  → Report saved to Supabase
  → Raw data discarded (only report retained)
  → Telegram notification: "Community analysis complete"
```

**Fleap-Specific Report Structure:**

| Section | Content |
|---|---|
| Overall sentiment | Toward digital Arisan / fintech savings in Indonesia |
| Top 3 community themes | What Indonesians are discussing around savings and Arisan |
| Trust barriers | What stops people from trusting digital Arisan platforms |
| Arisan pain points | Problems with traditional Arisan that Fleap can address |
| Competitor signals | Mentions of other digital Arisan or savings apps |
| Ketua Arisan behavior | How community leaders organize and influence adoption |
| Opportunity signals | Content gaps, untapped communities, distribution channels |
| Recommended action | One concrete next step for Fleap's marketing |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M07-01 | Analysis runs only on explicit user trigger — no background scheduling |
| FR-M07-02 | A run-in-progress state is shown during scraping and analysis |
| FR-M07-03 | Each analysis run is stored with its full report and timestamp |
| FR-M07-04 | Raw scraped data is not stored — only the processed AI report |
| FR-M07-05 | User can configure which sources to include before each run |
| FR-M07-06 | Reports are accessible to the AI agent during analysis sessions |
| FR-M07-07 | A Telegram notification is sent when analysis is complete |

---

### M08 — Competitor Intelligence Board

**Purpose:** Structured tracking of Fleap's competitive landscape — which includes formal digital competitors, adjacent fintech products, and informal Arisan (the biggest competitor of all). On-demand analysis, not passive monitoring.

**Competitor Categories:**

| Category | Examples |
|---|---|
| Direct digital Arisan apps | Other ROSCA / Arisan apps in the Indonesian market |
| Adjacent fintech | Jenius, GoPay Tabungan, OVO savings features |
| Informal / Traditional | Ketua Arisan-led WhatsApp groups — the primary alternative to Fleap |

**Core Features:**

- Competitor profile cards with category field
- Activity log per competitor (manual entry or scraped on demand)
- "Run Competitor Scan" button — AI-assisted analysis of competitor content and messaging
- Messaging comparison: Fleap's positioning vs competitor positioning
- Trust signal comparison: what competitors are doing to build or fail to build trust
- Weakness and opportunity flags surfaced by AI
- Historical scan archive

**Competitor Profile Structure:**

| Field | Notes |
|---|---|
| Name | — |
| Category | Direct / Adjacent fintech / Informal-Traditional |
| Platforms | Where they are active |
| Estimated audience size | Manual or scraped |
| Positioning statement | How they present themselves |
| Pricing / fee structure | If publicly available |
| Trust mechanisms | How they address default risk (or don't) |
| Primary acquisition channel | How they get users |
| Last updated | Timestamp |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M08-01 | Competitor profiles are manually created and maintained |
| FR-M08-02 | "Informal / Traditional" category profiles represent non-digital Arisan — manually maintained only |
| FR-M08-03 | "Run Competitor Scan" triggers on-demand scrape + AI analysis for selected digital competitors |
| FR-M08-04 | Scan results are structured: messaging shifts, trust signals, acquisition tactics, growth signals |
| FR-M08-05 | Competitor data is accessible to AI agent during Decision and Brainstorm sessions |
| FR-M08-06 | Each scan is archived with timestamp |
| FR-M08-07 | User can add manual activity log entries at any time between scans |

---

### M09 — Referral & Ketua Arisan Tracker

**Purpose:** Two-layer referral tracking. Standard link-based referral metrics for measurable channels, and a dedicated Ketua Arisan Program section for community leader management — the primary Phase 1 acquisition channel for Fleap.

---

#### Part A — Referral Tracker

**Core Features:**

- Active referral links overview: total links, clicks, conversions, conversion rate
- Per-link breakdown: source, clicks, app downloads, circle creation attributed
- Referral coefficient (K-factor) trend chart
- Conversion funnel: Invited → App installed → Account created → Joined/created a circle → Completed first cycle
- Manual entry fallback for untracked referrals

**Referral Coefficient Formula:**

```
K-factor = (Invites sent per user) × (Conversion rate of invites)
K > 1 = viral growth
K < 1 = referral supplements but does not drive growth
```

---

#### Part B — Ketua Arisan Program

**Purpose:** A micro-CRM for Fleap's community leader acquisition channel. Ketua Arisan (traditional Arisan group leaders) are the highest-trust, highest-leverage acquisition source in Phase 1. Their referrals are relationship-based, not link-based, and require dedicated tracking.

**Core Features:**

- Named Ketua Arisan profiles
- Relationship status: Prospecting / Contacted / Active / Inactive
- Circles they have brought into Fleap (count and details)
- Total members across their circles
- Activation rate of their referred members
- Retention rate of their circles (cycle completion %)
- Relationship notes and last contact date
- Assigned content to share (linked assets from Content Bank)
- Engagement history: touchpoints, responses, outcomes

**Ketua Arisan Profile Structure:**

| Field | Notes |
|---|---|
| Name | — |
| Location | City / Region (Jakarta, Bandung, etc.) |
| Community size | Estimated reach |
| Platform presence | WhatsApp Group / Facebook Group / TikTok |
| Relationship status | Prospecting / Contacted / Active / Inactive |
| Circles created on Fleap | Count |
| Total members referred | Count |
| Member activation rate | % who completed account setup |
| Circle completion rate | % of cycles completed without default |
| Last contact date | — |
| Notes | Freeform relationship notes |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M09-01 | Referral links are tracked with UTM parameters where possible |
| FR-M09-02 | K-factor is calculated and displayed with trend indicator |
| FR-M09-03 | Conversion funnel shows drop-off at each stage down to circle completion |
| FR-M09-04 | Ketua Arisan profiles are manually created and maintained |
| FR-M09-05 | A Ketua Arisan with Active status and 3+ circles created is flagged as a Power Leader |
| FR-M09-06 | Referral and Ketua Arisan data are accessible to AI agent during Analyst mode |
| FR-M09-07 | Ketua Arisan profiles can be linked to specific campaigns |

---

### M10 — Experiment Log

**Purpose:** Structured record of every growth experiment Fleap runs. The AI agent automatically creates and updates log entries when it makes a recommendation in Decision mode. Builds institutional memory over time.

**Core Features:**

- Experiment cards: hypothesis, setup, expected outcome, result, verdict
- Status pipeline: Open → In Progress → Concluded
- AI auto-creates entry when it issues a Decision mode recommendation
- User confirms or updates result when experiment concludes
- AI reads past experiments before making new recommendations in the same domain
- Filter by channel, campaign, status, verdict

**Experiment Entry Structure:**

| Field | Source | Notes |
|---|---|---|
| Hypothesis | AI-generated | What we believe will happen |
| Channel | AI or user | Platform being tested |
| Setup | AI-generated | What was done, what was measured |
| Expected outcome | AI-generated | Quantified prediction |
| Actual outcome | User-entered | What actually happened |
| Verdict | User or AI | Success / Failure / Inconclusive |
| AI recommendation | AI-generated | What the AI suggested at the time |
| Learnings | AI-generated | What this means for future decisions |
| Date opened | Auto | — |
| Date concluded | Auto | — |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M10-01 | AI agent automatically creates an experiment entry after every Decision mode recommendation |
| FR-M10-02 | Entry is created in "Open" status, transitions to "In Progress" when user acknowledges |
| FR-M10-03 | User manually enters actual outcome — AI then generates the learnings field |
| FR-M10-04 | AI agent calls `retrieve_experiments()` before making recommendations in Decision mode |
| FR-M10-05 | If a similar experiment exists, the AI must reference it explicitly in its reasoning |
| FR-M10-06 | Concluded experiments are stored as vector embeddings for semantic retrieval |

---

### M11 — Growth Phase Tracker

**Purpose:** Visual representation of Fleap's progress through its growth phases — mapped to both user milestones and regulatory milestones. Drives the AI agent's context: what phase Fleap is in determines what the agent recommends.

**Fleap Phase Definitions:**

| Phase | Milestone | Primary Focus | Key Dependencies |
|---|---|---|---|
| Phase 1 | OJK Sandbox approved + 100 beta users | ICP validation, first circles, Ketua Arisan seeding, messaging refinement | OJK sandbox active |
| Phase 2 | 1,000 active users, 50+ active circles | Referral loops, Ketua Arisan program, SEO, trust signal content | OJK sandbox active |
| Phase 3 | 10,000 active users, OJK full license path | Retention, advocacy scaling, community-led growth, vertical expansion | OJK commercial license in progress |

**Core Features:**

- Visual progress bar per phase with current active user count and circle count
- Phase-specific focus areas displayed as contextual guidance
- Regulatory milestone track running parallel to user milestone track
- Milestone log: key events with dates (OJK sandbox approval, first circle, first 100 users, etc.)
- Phase transition alert via Telegram and in-app when threshold is crossed
- Current phase injected into every AI agent session as live context

**Regulatory Milestone Track:**

| Milestone | Status Options |
|---|---|
| PSE Asing registration | Pending / Submitted / Approved |
| OJK Sandbox application | Pending / Submitted / In Review / Approved / Rejected |
| OJK Sandbox beta launch | Not started / Active |
| eKYC integration (Digisign/Privy) | Not integrated / Sandbox / Production |
| OJK commercial license path | Not started / In progress |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M11-01 | Active user count and active circle count are manually updated or synced from configured source |
| FR-M11-02 | Phase transitions trigger a Telegram notification and in-app alert |
| FR-M11-03 | Current phase and regulatory status are automatically injected into the AI agent's system prompt at session start |
| FR-M11-04 | Milestone log accepts manual entries with date and description |
| FR-M11-05 | Regulatory milestone statuses are manually updated |
| FR-M11-06 | If OJK Sandbox status is Rejected, a blocking alert appears across all modules |

---

### M12 — AI Agent Hub

**Purpose:** The embedded AI marketing intelligence layer. Dedicated space for structured sessions across three modes. Every session is logged. Every decision is recorded to the Experiment Log automatically. The agent has full context of Fleap's business, regulatory environment, competitive landscape, and growth state.

**Core Features:**

- Mode selector: Analyst / Decision / Brainstorm
- Persistent session history (searchable)
- Decision Journal: all recommendations with rationale, counter-arguments, and experiment links
- Context panel: live display of what the agent knows (current phase, OJK status, active campaigns, latest community analysis)
- Tool call transparency: agent shows which data it retrieved before reasoning
- Export session as Markdown

**Agent System Prompt Context (injected at every session start):**

- Fleap product overview: digital Arisan platform, wallet system, rank mechanics, escrow protection
- Current growth phase and phase-specific focus areas
- OJK regulatory status
- Active campaigns and their objectives
- Current channel health scores
- Latest community listening report summary
- Competitor landscape summary

---

**Agent Modes:**

#### Analyst Mode

```
Behavior contract:
1. Calls query_metrics() before any interpretation
2. States what the data means for Fleap's current phase and regulatory stage
3. Flags one anomaly or risk signal unprompted
4. Considers trust and compliance signals alongside growth metrics
5. Ends with an open question to guide next action
```

#### Decision Mode

```
Behavior contract:
1. States recommendation in the first sentence — no hedging
2. Shows the data and reasoning chain
3. Names the tradeoff explicitly — including regulatory or trust tradeoffs
4. Writes the strongest counter-argument against its own recommendation
5. States what evidence would change its mind
6. Auto-creates an Experiment Log entry after the session
```

#### Brainstorm Mode

```
Behavior contract:
1. Restates constraints before generating:
   - Current phase and what it permits
   - OJK regulatory boundaries
   - Organic-first, Indonesia-specific, Arisan cultural context
2. Generates 5 ideas — at least one unconventional
3. Scores each against Fleap's strategic principles (1–3 scale)
4. Picks its top candidate and argues for it as if defending in a meeting
5. Ends with "What's your objection?" and responds to pushback directly
```

---

**Agent Tool Functions:**

| Function | Description |
|---|---|
| `query_metrics(channel, date_range)` | Pulls structured metrics from Supabase |
| `retrieve_decisions(topic)` | Semantic search over past decisions via pgvector |
| `retrieve_experiments(domain)` | Pulls relevant past experiments |
| `retrieve_content(query)` | Semantic search over Content Bank |
| `log_decision(recommendation, rationale, alternatives, counter)` | Writes to Decision Journal and creates Experiment Log entry |
| `get_community_reports(n)` | Retrieves last n community listening reports |
| `get_competitor_data()` | Retrieves competitor profiles and scan data |
| `get_phase_context()` | Returns current growth phase, user count, circle count, OJK status |
| `get_ketua_arisan_summary()` | Returns Ketua Arisan program performance summary |

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M12-01 | Mode must be selected before each session begins |
| FR-M12-02 | Agent always injects full Fleap context at session start via `get_phase_context()` |
| FR-M12-03 | Tool calls are displayed to the user with a summary of what data was retrieved |
| FR-M12-04 | Decision mode auto-logs to Decision Journal and Experiment Log after every recommendation |
| FR-M12-05 | All sessions stored in Supabase with full conversation history |
| FR-M12-06 | Decision Journal is searchable and browsable outside of active sessions |
| FR-M12-07 | Agent must reference past experiments before making recommendations in the same domain |
| FR-M12-08 | Agent must flag if a recommendation is blocked by current OJK status |

---

### M13 — Notification Center

**Purpose:** Centralized alert system for time-sensitive events across all modules. Delivers in-app notifications and Telegram pushes based on configurable triggers.

**Notification Triggers:**

| Event | Priority | Channel |
|---|---|---|
| OJK sandbox status changes | Critical | In-app + Telegram |
| Compliance action item overdue | High | In-app + Telegram |
| Campaign goes live | Medium | In-app |
| Campaign milestone reached | High | In-app + Telegram |
| Channel health score drops below 40 | High | In-app + Telegram |
| Community analysis complete | Medium | In-app + Telegram |
| Competitor scan complete | Medium | In-app |
| Scheduled content due in 24h | Low | In-app |
| Content missed schedule | High | In-app + Telegram |
| Phase threshold crossed | High | In-app + Telegram |
| Ketua Arisan goes inactive (30+ days) | Medium | In-app + Telegram |
| K-factor drops below 0.5 | High | In-app + Telegram |
| AI decision logged | Low | In-app |

**Core Features:**

- Notification feed with read/unread state
- Per-trigger configuration: toggle on/off, choose in-app only or Telegram
- Telegram integration: one-time bot setup with webhook, messages sent to configured chat ID
- Notification history (last 90 days)

**Functional Requirements:**

| ID | Requirement |
|---|---|
| FR-M13-01 | Telegram integration requires one-time Bot Token + Chat ID configuration |
| FR-M13-02 | Each notification type is individually togglable |
| FR-M13-03 | Critical notifications (OJK status change) cannot be disabled |
| FR-M13-04 | Notification history is retained for 90 days |
| FR-M13-05 | Unread count is displayed on Command Center and in the nav |

---

## 7. Data Models

### Core Tables (Supabase PostgreSQL)

```sql
users                    -- Single user, managed by Supabase Auth
campaigns                -- M02
content_assets           -- M03
content_schedule         -- M04
channel_metrics          -- M06
community_reports        -- M07
competitor_profiles      -- M08
competitor_scans         -- M08
referral_links           -- M09A
referral_events          -- M09A
ketua_arisan_profiles    -- M09B
ketua_arisan_touchpoints -- M09B
experiments              -- M10
growth_milestones        -- M11
regulatory_milestones    -- M11
agent_sessions           -- M12
agent_messages           -- M12
decision_journal         -- M12
notifications            -- M13
```

### Vector Tables (pgvector)

```sql
campaign_embeddings           -- AI retrieval of past campaigns
content_asset_embeddings      -- Semantic content retrieval for generator
decision_embeddings           -- Past decision retrieval
experiment_embeddings         -- Past experiment retrieval
community_report_embeddings   -- Community analysis retrieval
competitor_embeddings         -- Competitor data retrieval
```

---

## 8. Integration Specifications

### 8.1 TikTok

| Item | Detail |
|---|---|
| API | TikTok for Business API (Display API) |
| Data pulled | Video views, engagement, follower count, top posts |
| Auth | OAuth 2.0 via TikTok Developer App |
| Frequency | On-demand (Sync Now button) |
| Fallback | Manual metric input |

### 8.2 Reddit

| Item | Detail |
|---|---|
| API | Reddit API (PRAW) |
| Data pulled | Post performance, subreddit activity, comment sentiment |
| Auth | Reddit OAuth App credentials |
| Use case | Community listening analysis + content performance tracking |
| Frequency | On-demand (Run Analysis trigger) |

### 8.3 Threads

| Item | Detail |
|---|---|
| API | Threads API (Meta) — where available |
| Fallback | Playwright headless scraper for public data |
| Data pulled | Post engagement, reply counts, growth signals |
| Frequency | On-demand |

### 8.4 Telegram Bot

| Item | Detail |
|---|---|
| Setup | BotFather token + Chat ID stored in environment variables |
| Trigger | FastAPI background task dispatches message on notification event |
| Message format | Plain text with priority indicators |
| Failure handling | Retry once, then log failed notification |

### 8.5 Claude Anthropic API

| Item | Detail |
|---|---|
| Model | claude-sonnet-4-6 |
| Auth | API key stored in environment variables |
| Max tokens | 2000 per response |
| Context injection | Fleap product context, phase, OJK status, campaigns, metrics injected at session start |
| Tool calls | Function-calling for all `query_*`, `retrieve_*`, and `log_*` operations |

---

## 9. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Performance | Page load under 2 seconds on standard connection |
| Availability | No uptime SLA (personal tool) — best effort |
| Security | All API keys in environment variables, never exposed to frontend |
| Data retention | All data retained indefinitely unless manually deleted |
| Cost ceiling | Total infrastructure + API cost must remain under $30/month at single-user volume |
| Offline | Not required — web-based only |
| Mobile | Responsive layout required — founder may access via mobile |
| Accessibility | WCAG AA for core navigation and content views |

---

## 10. Out of Scope (v1)

| Feature | Reason |
|---|---|
| Multi-user / team access | Single-user tool by design |
| Paid ad management | Organic-first strategy — add in v2 if needed |
| Native social publishing | Opo schedules; founder publishes manually or via platform app |
| CRM / full customer profiles | Separate concern, separate system |
| Image / video generation | Text-only content generator in v1 |
| WhatsApp integration | Not a publishing channel for Fleap's current strategy |
| Facebook Groups publishing | Community platform — listening only via manual input |
| Kaskus monitoring | Deprioritized — Reddit covers community intelligence need for v1 |
| eKYC provider dashboard | Digisign/Privy managed separately — Opo shows status only |
| OJK document management | Compliance documents managed externally — Opo tracks status only |
| Real-time collaboration | Out of scope, single user |
| Native mobile app | Web responsive covers the need |

---

## 11. Phased Delivery

### Phase A — Foundation (Weeks 1–3)
Auth · Supabase schema and vector setup · Command Center (KPI + Compliance widget) · Campaign Manager · Content Bank

### Phase B — Content Operations (Weeks 4–5)
Content Calendar · Content Generator (TikTok / Threads / Reddit with Fleap system prompt) · Channel Monitor

### Phase C — Intelligence Layer (Weeks 6–7)
Community Listening Feed · Competitor Intelligence Board · Referral & Ketua Arisan Tracker · Experiment Log

### Phase D — AI & Notifications (Weeks 8–9)
AI Agent Hub (all three modes + all tool functions + Fleap context injection) · Growth Phase Tracker (user + regulatory milestone tracks) · Notification Center + Telegram integration

### Phase E — Polish & Hardening (Week 10)
Performance optimization · Mobile responsiveness audit · Error handling · Environment config · Final QA

---

*Document version 1.1 — Fleap rebrand, Indonesia/OJK market context, Arisan-specific module updates.*