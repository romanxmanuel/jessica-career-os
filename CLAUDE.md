# CLAUDE.md — Jessica Career OS

## Project Overview

**Name:** Jessica Career OS
**Purpose:** A local-first job application intelligence dashboard that increases application output and interview conversion rate. Reduces burnout by providing a structured daily system with clear workflow, fit scoring, and auto-generated apply packets.

**Primary Goal:** Produce interviews faster by eliminating decision fatigue, manual document generation, and lost follow-ups.

---

## Non-Negotiables

- All data persists locally — no cloud dependency, no resets between sessions.
- No fake experience generation — all content derived from resume + job description only.
- No stealth automation, no anti-bot bypassing, no ToS violations.
- Human approval required before any application is marked `submitted`.
- Code must be modular, readable, and easy to extend.
- Every feature ships with exact terminal commands in comments or docs.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Runtime | Node.js (via Bun) | Fast install, built-in SQLite support coming, familiar |
| Framework | Next.js 14 (App Router) | File-based routing, SSR for local data, React UI |
| Database | SQLite via `better-sqlite3` | Zero-config, local file, no server needed |
| ORM | Drizzle ORM | Type-safe, lightweight, great SQLite support |
| UI | Tailwind CSS + shadcn/ui | Fast to build, clean, minimal, no design system overhead |
| LLM | Anthropic Claude API (optional) | Apply packet generation — gated behind human review |
| State | React Query (TanStack) | Local data fetching, caching, invalidation |
| Validation | Zod | Schema validation for job intake and data models |
| Testing | Vitest | Fast unit tests for scoring engine |

**Run command:**
```bash
bun install && bun run dev
```

---

## Folder Structure

```
jessica-career-os/
├── CLAUDE.md                   # This file
├── .env.local                  # API keys (never commit)
├── .env.example                # Safe template for keys
├── bun.lockb
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
│
├── db/
│   ├── schema.ts               # Drizzle table definitions
│   ├── migrations/             # Auto-generated migration files
│   └── seed.ts                 # Realistic demo seed data
│
├── lib/
│   ├── db.ts                   # DB connection singleton
│   ├── scoring/
│   │   ├── fit-score.ts        # Deterministic scoring engine
│   │   └── keywords.ts         # Keyword extraction utilities
│   ├── generators/
│   │   ├── resume-tailor.ts    # Resume bullet tailoring
│   │   ├── cover-letter.ts     # Cover letter generation
│   │   └── screening.ts        # Screening question answers
│   └── scheduler/
│       └── follow-up.ts        # Follow-up date calculation logic
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # Dashboard (KPIs + momentum)
│   ├── jobs/
│   │   ├── page.tsx            # Job list + intake
│   │   ├── [id]/
│   │   │   ├── page.tsx        # Job detail + fit score
│   │   │   └── packet/
│   │   │       └── page.tsx    # Apply packet view/edit
│   ├── tracker/
│   │   └── page.tsx            # Kanban pipeline
│   ├── sprint/
│   │   └── page.tsx            # Daily Sprint workflow
│   ├── outreach/
│   │   └── page.tsx            # Outreach message generator
│   └── api/
│       ├── jobs/
│       │   └── route.ts
│       ├── applications/
│       │   └── route.ts
│       ├── score/
│       │   └── route.ts
│       ├── generate/
│       │   └── route.ts        # LLM generation endpoint
│       └── follow-ups/
│           └── route.ts
│
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── dashboard/
│   │   ├── KPICard.tsx
│   │   └── MomentumChart.tsx
│   ├── jobs/
│   │   ├── JobIntakeForm.tsx
│   │   ├── FitScoreBar.tsx
│   │   └── JobCard.tsx
│   ├── tracker/
│   │   ├── KanbanBoard.tsx
│   │   └── KanbanColumn.tsx
│   ├── sprint/
│   │   └── SprintQueue.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       └── HumanApprovalGate.tsx
│
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `JobCard.tsx` |
| Files (lib/utils) | kebab-case | `fit-score.ts` |
| DB tables | snake_case | `job_applications` |
| Drizzle schema | camelCase objects | `jobApplications` |
| API routes | REST nouns | `/api/jobs`, `/api/applications` |
| Env vars | SCREAMING_SNAKE | `ANTHROPIC_API_KEY` |
| Branch names | kebab-case | `feature/fit-scoring` |

---

## Data Model

### `jobs`
```
id            TEXT PRIMARY KEY (cuid)
title         TEXT NOT NULL
company       TEXT NOT NULL
location      TEXT
job_type      TEXT (full-time | contract | part-time)
remote        INTEGER (0/1 boolean)
url           TEXT
raw_jd        TEXT NOT NULL       -- full job description paste
parsed_skills TEXT               -- JSON array of extracted skills
fit_score     INTEGER            -- 0-100 deterministic score
fit_breakdown TEXT               -- JSON score breakdown
status        TEXT DEFAULT 'new' -- new | queued | applying | applied | archived
priority      INTEGER DEFAULT 0  -- 1=high, 0=normal, -1=skip
notes         TEXT
created_at    INTEGER NOT NULL   -- Unix timestamp
updated_at    INTEGER NOT NULL
```

### `resume_profiles`
```
id            TEXT PRIMARY KEY
label         TEXT NOT NULL      -- e.g. "Product Manager v2"
content       TEXT NOT NULL      -- full resume text
skills        TEXT               -- JSON array
is_default    INTEGER DEFAULT 0
created_at    INTEGER NOT NULL
```

### `applications`
```
id              TEXT PRIMARY KEY
job_id          TEXT NOT NULL REFERENCES jobs(id)
resume_id       TEXT REFERENCES resume_profiles(id)
status          TEXT DEFAULT 'draft'
  -- draft | human_review | submitted | interviewing | offer | rejected | ghosted
cover_letter    TEXT
tailored_resume TEXT
screening_qa    TEXT             -- JSON array {question, answer}
submitted_at    INTEGER          -- set only after human confirms
created_at      INTEGER NOT NULL
updated_at      INTEGER NOT NULL
```

### `follow_ups`
```
id              TEXT PRIMARY KEY
application_id  TEXT NOT NULL REFERENCES applications(id)
due_date        INTEGER NOT NULL -- Unix timestamp
type            TEXT             -- initial | week1 | week2 | thank_you
status          TEXT DEFAULT 'pending' -- pending | sent | skipped
message         TEXT
created_at      INTEGER NOT NULL
```

### `contacts`
```
id              TEXT PRIMARY KEY
job_id          TEXT REFERENCES jobs(id)
name            TEXT
title           TEXT
linkedin_url    TEXT
email           TEXT
notes           TEXT
created_at      INTEGER NOT NULL
```

### `daily_sprints`
```
id              TEXT PRIMARY KEY
date            TEXT NOT NULL UNIQUE -- YYYY-MM-DD
goal_count      INTEGER DEFAULT 5
completed_count INTEGER DEFAULT 0
notes           TEXT
created_at      INTEGER NOT NULL
```

---

## Fit Scoring Engine (Deterministic)

No LLM in the scoring loop. Score is computed from measurable signals:

| Signal | Weight | Method |
|---|---|---|
| Skill keyword match | 40% | Resume skills vs JD required skills (exact + stem match) |
| Title similarity | 20% | Levenshtein / token overlap vs resume headline |
| Seniority alignment | 15% | Level extracted from JD vs resume years |
| Location/remote match | 10% | Remote flag + location string match |
| Compensation range | 10% | If listed, vs target range in profile |
| Company size pref | 5% | Startup/enterprise tag vs user preference |

Score breakdown stored as JSON in `jobs.fit_breakdown` for full transparency.

---

## Apply Packet Generator

Inputs: `resume_profile.content` + `jobs.raw_jd`
Output: tailored resume bullets, cover letter draft, screening Q&A

Rules:
- Only factual content from resume is used — no invented achievements.
- LLM call is optional; template-based fallback always available.
- Human must review and approve before `applications.status` moves to `submitted`.
- `HumanApprovalGate` component enforces this in UI.

---

## Development Checklist

### Phase 1 — Foundation
- [ ] Repo init, Next.js + Bun setup
- [ ] Drizzle + SQLite schema + migrations
- [ ] Seed data (5 jobs, 2 resume profiles, 3 applications)
- [ ] Layout shell with nav

### Phase 2 — Core Features
- [ ] Job Intake form (paste JD → parse + store)
- [ ] Fit Scoring Engine + score display
- [ ] Resume Profile CRUD
- [ ] Apply Packet Generator (template mode)
- [ ] Human Approval Gate component

### Phase 3 — Tracking
- [ ] Kanban Application Tracker
- [ ] Follow-up Scheduler
- [ ] Dashboard KPIs

### Phase 4 — Productivity
- [ ] Daily Sprint page
- [ ] Outreach Message Generator
- [ ] Optional: Claude API integration for generation

### Phase 5 — Polish
- [ ] Demo seed data mode
- [ ] Export (CSV/JSON)
- [ ] Error boundaries + loading states

---

## Definition of Done (MVP)

MVP is complete when:
1. A job can be pasted in and scored in under 30 seconds.
2. An apply packet (cover letter + tailored bullets) can be generated and reviewed.
3. Applications move through Kanban stages with human confirmation for `submitted`.
4. Follow-up reminders surface on the Daily Sprint page.
5. Dashboard shows total applied, response rate, and interviews booked.
6. All data persists across server restarts via local SQLite file.
7. App runs with `bun install && bun run dev` — no other setup required.

---

## Safety & Compliance

| Rule | Implementation |
|---|---|
| No auto-submit | `submitted_at` only set after explicit user action in `HumanApprovalGate` |
| No fake content | Generator prompts include hard constraint: "Use only facts from the provided resume" |
| No bot bypassing | No browser automation, no CAPTCHA solving, no headless browser |
| Data stays local | SQLite file in repo root (`career.db`) — never uploaded |
| API keys safe | `.env.local` gitignored; `.env.example` has placeholder values only |
| No PII leakage | No telemetry, no external data calls except optional LLM API |

---

## Environment Variables

```bash
# .env.local (never commit)
ANTHROPIC_API_KEY=sk-ant-...   # Optional: only needed for AI generation
DATABASE_URL=./career.db        # Local SQLite path
```

---

## Commands Reference

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run DB migrations
bun run db:migrate

# Seed demo data
bun run db:seed

# Open Drizzle Studio (DB GUI)
bun run db:studio

# Run tests
bun run test

# Build for production
bun run build
```

---

## Session Recovery & Prompt Continuity

A file called `Prompts.md` exists in the project root. It contains numbered prompts (Prompt 0 through Prompt 14) that define the full build sequence for this project.

**On every session start or restart:**
1. Read `Prompts.md` to identify which prompt was last completed.
2. Resume from the next prompt in sequence without asking the user to re-explain context.
3. Track progress by checking which features are already built (look at the `app/` directory and existing API routes).

**Current build sequence** (update this as prompts complete):
- [x] CLAUDE.md + Prompts.md setup
- [x] Prompt 0 — Project goal and stack selection
- [x] Prompt 1 — Scaffold, layout, home page, navigation
- [x] Prompt 2 — Database schema + seed data
- [x] Prompt 3 — Job Intake flow (/jobs/new, /jobs, /jobs/[id])
- [x] Prompt 4 — Scoring engine
- [x] Prompt 5 — Apply Packet generator (/jobs/[id]/packet/[appId])
- [x] Prompt 6 — Daily Sprint page (/sprint)
- [x] Prompt 7 — Application tracking + follow-up (/tracker)
- [x] Prompt 8 — KPI dashboard with time-series metrics
- [x] Prompt 9 — Outreach engine (contact store + message packs)
- [x] Prompt 10 — Speed polish (command palette, keyboard shortcuts, autosave)
- [x] Prompt 11 — Reliability pass + improved seed data + demo mode
- [x] Prompt 12 — Fill Assist panel with ATS detection (shipped as part of Prompt 10)
- [x] Prompt 13 — Ship checklist
- [x] Prompt 14 — GitHub, README, Vercel deploy

---

## Claude Code Behavior Notes

- Always read existing files before modifying them.
- Do not add libraries not listed in this file without confirming with user.
- Do not generate placeholder or lorem ipsum content — use realistic demo data.
- Scoring engine changes must include updated test coverage in Vitest.
- Do not auto-submit or simulate form submissions.
- Keep components small and single-purpose.
- API routes should validate input with Zod before touching the DB.
