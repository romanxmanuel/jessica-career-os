# Jessica Career OS

A local-first job application intelligence dashboard. Designed to go from zero to applied in as few clicks as possible — with fit scoring, AI-assisted packet generation, and a daily workflow that eliminates decision fatigue.

**Built for:** Jessica L. Herman, Accounts Receivable Specialist
**Data stays on your computer.** Nothing is auto-submitted. Human approval required for every submission.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fjessica-career-os&project-name=jessica-career-os&repository-name=jessica-career-os)

> **Note:** The Vercel demo resets on each cold start (SQLite lives in `/tmp`). For real use, run locally — your data persists permanently.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/jessica-career-os.git
cd jessica-career-os

# Install dependencies
npm install

# Set up the database
npm run db:migrate

# Load demo data (Jessica's resume + sample AR jobs in Central FL)
npm run db:seed

# Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in any keys you have:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `RAPIDAPI_KEY` | Optional | Enables "Find Today's Jobs" button (JSearch API) |
| `OPENROUTER_API_KEY` | Optional | AI-powered apply packets (recommended) |
| `ANTHROPIC_API_KEY` | Optional | AI-powered apply packets (direct) |
| `OPENAI_API_KEY` | Optional | AI-powered apply packets (GPT-4o) |
| `DATABASE_URL` | Optional | Defaults to `./career.db` in project root |

You don't need any API keys to use the app. Template-based generation always works without keys.

---

## Daily Workflow

### Every morning:

1. **Today's Hunt** (`/hunt`) — Click "Find Today's Jobs" to pull 20 AR Specialist openings in Central Florida, auto-scored against your resume.

2. **Queue your top picks** — Click "Queue" on the best matches. Skip the rest.

3. **Build All Packets** — One click generates cover letters, resume bullets, outreach messages, and screening Q&A for every queued job.

4. **Apply one at a time** — Click "Let's Apply →" to open the Fill Assist panel. It guides you step-by-step: open the application, copy materials in order, paste into the form.

5. **Mark as Submitted** — After you've submitted on the company's site, click "I've Submitted This Application." This is the only way it gets logged.

6. **Send follow-ups** (`/sprint`) — Any follow-ups due today are surfaced here with pre-written messages ready to copy.

---

## Adding Jobs Manually

1. Go to **Job List** (`/jobs`) → click **Add a Job**
2. Paste the job description into the text box
3. Fill in company name, title, and URL
4. Click **Save** — the app auto-scores it against your resume instantly

---

## Where Your Data Lives

- **Database file:** `career.db` in the project root
- **Backup:** Just copy the file — `cp career.db career.db.backup`
- **Reset to demo data:** Run `npm run db:seed` (⚠️ wipes all existing data)

```bash
# Manual backup
cp career.db "career-backup-$(date +%Y%m%d).db"
```

---

## Exporting Apply Packets

From any packet page (`/jobs/[id]/packet/[appId]`):
- Use the **Fill Assist** panel to copy materials one at a time
- Or use the copy buttons on each section individually

To export all packets as text (useful for weekly review):
```bash
# Export cover letters from the past 7 days:
sqlite3 career.db "SELECT j.company, j.title, a.cover_letter FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.submitted_at > datetime('now', '-7 days');" > packets-this-week.txt
```

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `⌘K` or `Ctrl+K` | Open command palette (jump anywhere) |
| `n` | New job (when not typing in a text field) |
| `↑` / `↓` | Navigate command palette |
| `Enter` | Select command palette item |
| `Escape` | Close command palette |

---

## Features

- **Fit Scoring** — Deterministic, no AI. Every job scored 0–100 against your resume with plain-English explanations (✅ 6/8 skills match · ⚠️ Salary not listed)
- **Apply Packet Generator** — Cover letter, tailored resume bullets, outreach message, screening Q&A. Template mode (instant) or AI mode (requires API key)
- **Fill Assist** — Step-by-step copy guide with ATS detection (Workday, Greenhouse, Lever, iCIMS, Indeed, LinkedIn, Taleo)
- **Human Approval Gate** — Applications can only be marked "submitted" after you manually click the button — no auto-submit ever
- **Application Tracker** — Kanban view: Draft → Submitted → Interviewing → Offer / Rejected
- **Follow-up Scheduler** — Auto-scheduled when you apply; pre-written messages ready on sprint page
- **Outreach Engine** — Full outreach packs (recruiter + hiring manager + follow-up) with subject lines and contact manager
- **KPI Dashboard** — Response rate, interview rate, weekly chart, keyword correlation, weekly action plan
- **Command Palette** — `⌘K` to jump anywhere instantly
- **Auto-save** — Packet editor saves your edits after 2 seconds

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM |
| UI | Tailwind CSS + shadcn/ui components |
| AI (optional) | Anthropic Claude / OpenRouter / OpenAI |
| Validation | Zod |
| Language | TypeScript |

---

## Commands Reference

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run db:migrate   # Run database migrations
npm run db:seed      # Load demo data (⚠️ resets all data)
npm run db:studio    # Open Drizzle Studio (visual DB browser)
npm run test         # Run Vitest unit tests
```

---

## Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/jessica-career-os.git
git push -u origin main
```

### Step 2 — Import in Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `jessica-career-os` repository
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**

### Step 3 — Add optional env vars

In Vercel project settings → Environment Variables, add any keys you want:
- `RAPIDAPI_KEY` — enables job discovery
- `OPENROUTER_API_KEY` — enables AI packet generation

> **How it works on Vercel:** On each cold start, the app creates a fresh SQLite database in `/tmp` and seeds it with demo data automatically. Data resets when the function goes cold. For persistent data, run locally.

### One-click Deploy

Click the button at the top of this README to deploy your own instance instantly.

---

## Safety & Privacy

- All data is stored locally in `career.db` — never uploaded anywhere
- No telemetry, no tracking, no external calls (except optional AI API and JSearch API)
- Applications are **never** auto-submitted — the human approval button is the only way
- AI generation prompts explicitly forbid inventing experience or credentials not in your resume
- `.env.local` is gitignored — your API keys never leave your machine
- Personal PDF files are gitignored — never committed to the repo

---

## Project Structure

```
jessica-career-os/
├── app/                    # Next.js pages + API routes
│   ├── hunt/               # Today's Job Hunt (daily entry point)
│   ├── jobs/               # Job list, intake, detail, packet editor
│   ├── tracker/            # Kanban application tracker
│   ├── sprint/             # Daily sprint + follow-ups
│   ├── outreach/           # Outreach messages + contacts
│   ├── resume/             # Resume profile manager
│   ├── dashboard/          # KPI metrics + weekly review
│   └── api/                # REST API routes
├── components/             # Reusable UI components
│   ├── sidebar.tsx         # Navigation
│   └── command-palette.tsx # ⌘K command palette
├── lib/
│   ├── db.ts               # Database connection singleton
│   ├── scoring/            # Fit scoring engine (no AI)
│   ├── generators/         # Template + AI packet generators
│   ├── discovery/          # JSearch API client
│   └── ai-client.ts        # Multi-provider AI client
├── db/
│   ├── schema.ts           # Database table definitions
│   ├── migrations/         # Drizzle migration files
│   ├── seed.ts             # Full demo data (npm run db:seed)
│   └── demo-seed.ts        # Minimal seed for Vercel cold starts
├── vercel.json             # Vercel deployment config
└── career.db               # Your local SQLite database (gitignored)
```
