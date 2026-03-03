# Jessica Career OS

Your personal job search assistant. Built for **Jessica L. Herman, Accounts Receivable Specialist**.

**Live demo:** [jessica-career-os.vercel.app](https://jessica-career-os.vercel.app)

---

## How to Use It — Step by Step

### Every morning, do this in order:

---

**Step 1 — Find today's job openings**

Go to **Today's Hunt** in the left menu.

Click the big **"Find Today's Jobs"** button.

The app will automatically search for Accounts Receivable Specialist, Billing Specialist, and Collections jobs in Central Florida. It scores each one against your resume (0–100) and shows you why.

---

**Step 2 — Pick the best ones**

For each job that looks good, click **"Queue for Today"**.

For ones that don't look right, click **"Skip"**.

You don't have to do them all — just pick your best 3–5.

---

**Step 3 — Build your apply packets**

Click **"Generate All Packets"** on the Hunt page.

This creates a cover letter, tailored resume bullets, and an outreach message for every job you queued. It takes about 30 seconds per job.

---

**Step 4 — Apply, one at a time**

For each queued job, click **"Let's Apply →"**

This opens a step-by-step guide called **Fill Assist**:

1. Click **"Open Application"** — the job posting opens in a new tab
2. Click **"Copy Cover Letter"** — paste it into the cover letter field
3. Click **"Copy Resume Bullets"** — paste into the work history section
4. When you're done submitting on their website, come back and click **"I've Submitted This Application"**

That last click is the only way an application gets logged. The app never submits anything for you.

---

**Step 5 — Check your follow-ups**

Go to **Today's To-Do** in the left menu.

Any follow-up messages due today are listed here with the message already written. Copy and send.

---

### Adding a job you found yourself

If you find a job on LinkedIn, Indeed, or anywhere else:

1. Go to **Job List** → click **"Add a Job"**
2. Paste the full job description into the text box
3. Fill in the company name, job title, and the link to the posting
4. Click **Save** — the app scores it instantly

---

### Checking your progress

**My Overview** (the home page) shows your totals: how many you applied to, how many replied, and what's due today.

**My Applications** shows a board of everything you've applied to, organized by stage (applied → interviewing → offer/rejected).

**How I'm Doing** shows weekly charts of your application activity and which skills are appearing most in the jobs you're targeting.

---

## AI Cover Letters

The app writes cover letters two ways:

- **Template mode** — instant, no account needed, always works. Good quality.
- **AI mode** — uses Claude AI to write more natural, personalized letters. Better quality, especially for follow-up paragraphs.

To turn on AI mode, you need a free API key from one of these (pick one):

| Option | Where to get it | Cost |
|---|---|---|
| **Anthropic (Claude)** — recommended | [console.anthropic.com](https://console.anthropic.com) | ~$0.01–0.03 per cover letter |
| OpenRouter | [openrouter.ai](https://openrouter.ai) | Free credits to start |
| OpenAI (ChatGPT) | [platform.openai.com](https://platform.openai.com) | ~$0.02 per cover letter |

Once you have a key, tell your developer to add it to the app settings (it takes 2 minutes).

---

## Keyboard Shortcuts

| Key | What it does |
|---|---|
| `⌘K` (Mac) or `Ctrl+K` (Windows) | Jump to any page instantly |
| `n` | Add a new job (when you're not typing) |
| `Escape` | Close any popup |

---

## Your Data

- All your jobs, applications, and cover letters are saved in a **Turso cloud database** — they persist permanently across all sessions
- Nothing is ever auto-submitted to employers — you always click the button yourself
- Your resume and personal info never leave the database

---

## For Developers

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | Turso (libsql) — cloud SQLite |
| ORM | Drizzle ORM |
| UI | Tailwind CSS + shadcn/ui |
| AI (optional) | Anthropic Claude / OpenRouter / OpenAI |
| Validation | Zod |
| Language | TypeScript |

### Local Development

```bash
git clone https://github.com/romanxmanuel/jessica-career-os.git
cd jessica-career-os
npm install
npm run db:migrate    # creates local career.db
npm run db:seed       # loads demo data
npm run dev           # http://localhost:3000
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `TURSO_DATABASE_URL` | Production | Turso cloud DB URL |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token |
| `RAPIDAPI_KEY` | Optional | "Find Today's Jobs" button (JSearch API) |
| `OPENROUTER_API_KEY` | Optional | AI cover letter generation |
| `ANTHROPIC_API_KEY` | Optional | AI cover letter generation (direct) |
| `OPENAI_API_KEY` | Optional | AI cover letter generation (GPT-4o) |

### Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run db:migrate       # Run SQLite migrations (local only)
npm run db:seed          # Seed local career.db with demo data
npm run db:seed:remote   # Seed Turso cloud DB (needs TURSO_* env vars)
npm run db:studio        # Open Drizzle Studio (visual DB browser)
```

### Seeding the Remote Database

```bash
TURSO_DATABASE_URL=libsql://... \
TURSO_AUTH_TOKEN=... \
npm run db:seed:remote
```

### Project Structure

```
jessica-career-os/
├── app/
│   ├── hunt/               # Today's Job Hunt (daily entry point)
│   ├── jobs/               # Job list, intake, detail, packet editor
│   ├── tracker/            # Kanban application tracker
│   ├── sprint/             # Daily To-Do + follow-ups
│   ├── outreach/           # Outreach messages + contacts
│   ├── resume/             # Resume profile manager
│   ├── dashboard/          # KPI metrics + weekly review
│   └── api/                # REST API routes
├── components/
│   ├── sidebar.tsx         # Navigation
│   └── command-palette.tsx # ⌘K command palette
├── lib/
│   ├── db.ts               # Database connection (Turso / local SQLite)
│   ├── scoring/            # Fit scoring engine (no AI)
│   ├── generators/         # Template + AI packet generators
│   ├── discovery/          # JSearch API client
│   └── ai-client.ts        # Multi-provider AI client
├── db/
│   ├── schema.ts           # Table definitions
│   ├── migrations/         # Drizzle migration files
│   ├── seed.ts             # Local demo data seed
│   └── seed-turso.ts       # Remote Turso seed script
└── vercel.json             # Vercel deployment config
```

### Safety

- No auto-submit ever — `submittedAt` only set after human clicks the button
- No fake experience — AI is explicitly told to only use facts from the resume
- No telemetry — no external calls except optional AI API and JSearch API
- API keys gitignored — never leave the machine
