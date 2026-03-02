Claude.md Prompt:
Create a project-specific CLAUDE.md file for this repository.

Project Name: Jessica Career OS

Purpose:
A local-first job application intelligence dashboard designed to increase application output and interview conversion rate quickly. The goal is to reduce burnout and create a structured daily system that produces interviews.

Core Objectives:
1. Accelerate application generation (resume tailoring, cover letters, screening answers).
2. Rank jobs by fit using deterministic scoring.
3. Track applications, follow-ups, and interview metrics.
4. Provide a Daily Sprint workflow to reduce decision fatigue.
5. Keep human-in-the-loop for final submission (no ToS-bypassing auto-submit bots).

Non-Negotiables:
- Must run locally with persistent data (no resets).
- Clean, employer-friendly structure.
- No fake experience generation.
- No stealth automation or anti-bot bypassing.
- Human approval required before marking an application submitted.
- Code must be modular and readable.
- Provide exact terminal commands for setup and running.

Architecture Requirements:
- Local database for persistence.
- Clear separation of:
  - data layer
  - scoring engine
  - apply packet generator
  - UI components
- Deterministic job scoring (no hallucinated AI scoring).
- Template-based generation that uses only resume + job description data.

Feature Map:
- Dashboard (KPIs + momentum metrics)
- Job Intake (paste JD fast)
- Fit Scoring Engine
- Apply Packet Generator
- Application Tracker (Kanban pipeline)
- Follow-up Scheduler
- Outreach Message Generator
- Daily Sprint page

Development Guidelines:
- Prefer speed and simplicity over overengineering.
- Use realistic seed data for demo mode.
- Keep UI minimal and productivity-focused.
- No unnecessary libraries.

Add:
- Folder structure plan
- Naming conventions
- Data model outline
- Development checklist
- “Definition of Done” for MVP
- Safety/compliance section

After creating CLAUDE.md, immediately propose the best stack for building this fast locally and begin implementation.

-----

Prompt 0 — Project goal + non-negotiables (sets direction)
We need to build a local app called “Jessica Career OS” that dramatically increases job application output and interview rate fast.

Success metric: interviews booked per week. Secondary metrics: applications submitted, response rate, follow-ups sent.

Build a local dashboard that:
1) Captures jobs quickly (paste URL + paste job description OR fetch from URL if possible).
2) Scores fit automatically (role fit, keywords, seniority mismatch flags).
3) Generates an “Apply Packet” with:
   - ATS-tuned resume bullet rewrites (based on Jessica’s base resume + the job description)
   - Short targeted cover letter
   - Screening question answers (bank + job-specific drafts)
   - Recruiter/hiring manager outreach message (LinkedIn/email)
4) Tracks submissions and schedules follow-ups automatically.
5) Shows daily KPIs and “Today’s Queue” with a simple workflow: Intake → Generate → Review → Submit → Follow-up.

Constraints:
- We need speed and stability over perfect architecture.
- Local-first. Should run on Mac/Windows easily.
- Human-in-the-loop final review + submission (no stealth auto-submit bots or bypassing ToS).
- Provide exact terminal commands for setup and run.

Start by proposing a stack optimized for building fast locally (choose one and proceed).
Then implement it end-to-end.


-----


Prompt 1 — Choose the fastest stack and generate the initial scaffold
Pick the fastest stack to ship this local dashboard today. Prefer:
- A web UI with modern components
- A local database for persistence
- Easy local run commands

I want you to:
1) Choose the stack and justify quickly (1 paragraph).
2) Output exact terminal commands to initialize the project.
3) Create the project scaffold and a clean file structure.
4) Implement a minimal home page and navigation.

Proceed without asking me questions. Use sensible defaults.


-----


Prompt 2 — Database schema + seed data (make it usable immediately)
Now design and implement the database schema for Jessica Career OS.

We need these entities:
- profile (Jessica preferences + target roles + locations + remote/hybrid + salary band + industries)
- resume_base (raw resume text + structured sections)
- resume_variants (AR/AP/People Ops variants)
- jobs (url, company, title, location, jd_text, source, date_added, status)
- scores (job_id, score_total, keyword_overlap, seniority_flag, missing_keywords)
- artifacts (job_id, tailored_bullets, cover_letter, screening_answers_json, outreach_message, generated_at)
- applications (job_id, submitted_at, status, notes, next_followup_at)
- followups (application_id, due_at, message, sent_at)

Implement migrations and seed data with:
- 1 example profile
- 2 resume variants (AR/AP + People Ops)
- 5 fake jobs with realistic descriptions

Then create a “DB viewer” admin page so we can see records quickly.
No placeholders — make the seed content realistic.


-----


Prompt 3 — Job Intake flow (make adding jobs frictionless)
Build the Job Intake experience.

We need a page: /jobs/new with:
- paste job URL
- paste job description textarea (required)
- optional fields: company, title, location
- “Auto-extract” button: attempt to fetch title/company from the pasted text using heuristics (don’t rely on external APIs)
- Save creates a job record and sets status = “intake”

Also create:
- /jobs list view with filters (status, location, remote)
- /jobs/[id] detail view showing the JD text cleanly.

Goal: Jessica can add 10 jobs in 10 minutes with copy/paste.


-----

Prompt 4 — Scoring engine (rank the queue so she doesn’t waste time)
Implement the scoring engine.

Inputs:
- job description text
- selected resume variant text (AR/AP/People Ops)
- Jessica target preferences from profile

Outputs:
- score_total (0-100)
- keyword_overlap percentage
- list of missing_keywords (top 10)
- seniority_flag if the JD suggests higher seniority than Jessica’s resume (heuristic)
- fit_notes: 3 bullet reasons why this job is good/bad

Implement scoring as deterministic heuristics (not AI) so it’s fast and reliable:
- keyword overlap: TF-IDF-ish simplified or top-term frequency
- penalize mismatched title keywords (“Senior”, “Manager”)
- boost if JD contains target tools/phrases

Run scoring automatically after job creation and when resume variant changes.
Show score on job list.
Add “Today’s Queue” page that sorts by best score and newest.



-----


Prompt 5 — The Apply Packet generator (the engine that creates interviews)
Build the Apply Packet generator on /apply/[jobId].

Workflow:
1) Select resume variant (dropdown)
2) Click “Generate Apply Packet”
3) The system produces:
   A) Tailored Resume Bullets: rewrite 6-10 bullets to mirror JD language (ATS friendly, not buzzwords)
   B) Cover Letter: 150-220 words, specific, confident, non-needy tone
   C) Screening Answers: generate drafts for common ATS questions:
      - “Tell me about yourself”
      - “Why this role/company”
      - “Strengths”
      - “Weaknesses”
      - “Reason for leaving / looking”
      - “Salary expectations”
      - “Work authorization”
      - “Remote/hybrid preference”
   D) Outreach Message: 2 versions (LinkedIn DM + email) short and direct

IMPORTANT:
- Do not hallucinate fake experience.
- Do not invent tools she doesn’t have.
- Use only information contained in resume variant + profile + JD.
- Keep language crisp, professional, and results-focused.

Since Claude Code can’t call external LLMs reliably without keys, implement generation with:
- template + rule-based transformations
- plus optional integration point for an LLM provider key if user adds it later

Even without an LLM key, it must output high-quality drafts using smart templating and keyword insertion.

Add “Copy” buttons for each section.
Add “Export Apply Packet” that downloads a .txt file with all sections.


-----


Prompt 6 — Burnout reducer: one-click daily execution plan
Build a “Daily Sprint” page.

When Jessica opens it, she sees:
- “Today’s Queue” (top 10 jobs by score)
- For each job: buttons:
  - Generate packet
  - Mark submitted
  - Create follow-up

Add a “Daily Plan Generator” at top:
- It creates a checklist:
  1) Intake X jobs
  2) Generate packets for top Y jobs
  3) Submit top Z jobs
  4) Send outreach messages for Z jobs
  5) Follow-ups due today

Make it feel like a game:
- Progress bar
- Counts
- “Streak” metric (days where she completed plan)

Goal: reduce thinking, increase doing.


-----


Prompt 7 — Application tracking + follow-up automation
Implement application tracking.

When Jessica clicks “Mark Submitted”:
- create an application record
- set status=submitted
- automatically schedule follow-up for 5 business days later

Create /followups page:
- shows follow-ups due today and overdue
- each has a prefilled follow-up message draft referencing role + company
- “Mark sent” button logs sent_at

Add /pipeline page:
- Kanban style columns:
  - Drafted
  - Submitted
  - Follow-up Sent
  - Interview
  - Rejected
  - Offer

Allow moving cards between columns and updating notes.



-----



Prompt 8 — KPI dashboard that tells you what’s working
Build /dashboard with real metrics and simple charts.

KPIs:
- Applications submitted (7/14/30 days)
- Response rate (% with any reply)
- Interview rate (interviews / submitted)
- Follow-ups sent
- Time-to-first-response average

Also add:
- “Top sources” performance (if source tracked)
- “Best role type” performance (AR/AP/People Ops)
- “Best keywords” correlation: which keywords appear in jobs that respond (simple frequency compare)

Add a “Weekly Review” section:
- What to do next week (3 action bullets)
- Which job types to apply to more
- Which to stop applying to (low response)


-----



Prompt 9 — Outreach engine (this is where interviews actually come from)
Add an Outreach feature.

For each submitted job, generate:
- a recruiter outreach message
- a hiring manager outreach message
- a follow-up after 5 days

Add a “Find Contacts” section that is manual:
- fields for recruiter name + email or LinkedIn URL
- store it on the application record

Add a one-click “Outreach Pack” export:
- 3 messages + subject lines
- clean and short

Tone guidelines:
- confident, specific, 4-6 sentences max
- no begging, no “just checking in”
- includes 1 credibility line + 1 ask + 1 frictionless close



-----




Prompt 10 — Make it fast to operate (speed polish)
Now do a speed/polish pass focused on reducing friction.

Add:
- global command palette (Ctrl/Cmd+K):
  - new job
  - open today queue
  - open followups
  - open dashboard
- autosave drafts on apply page
- keyboard shortcuts:
  - n = new job
  - g = generate apply packet
  - s = mark submitted
  - f = create follow-up
- add inline “copy” buttons everywhere

Ensure the UI is clean and readable.
Prioritize speed over fancy visuals.



-----



Prompt 11 — Reliability pass + test data + “demo mode”
Make sure everything works reliably.

Add:
- robust input validation
- guardrails (cannot mark submitted without job)
- error banners with clear messages
- regenerate scoring if JD updated

Improve seed data so the app is impressive:
- 10 realistic jobs across AR/AP/People Ops
- 20 application records across statuses
- follow-ups due today

Add “Demo Mode” toggle:
- loads demo seed dataset
- doesn’t overwrite real data

Finally, create a README with:
- setup commands
- how to use daily sprint
- how to add jobs fast
- how to export apply packet




-----




Prompt 12 — Optional: Browser-assisted autofill (human-initiated)
Add OPTIONAL browser-assisted autofill that remains human-initiated.

If feasible, implement a tool that:
- opens the job application link in the browser
- shows a side panel checklist of what to paste where (not auto-submission)
- optionally copies fields to clipboard sequentially (resume bullets, cover letter, screening answers)

Do NOT attempt to bypass anti-bot measures.
Do NOT automate clicking submit.
Human must remain in control.




-----




Prompt 13 — Ship checklist
Finalize.

1) Run lint/build checks.
2) Fix any TypeScript errors.
3) Ensure “npm run dev” starts cleanly.
4) Ensure DB persists and data loads.
5) Add a “Reset DEMO data” button for demos only.
6) Give me:
   - exact run commands
   - where the DB file lives
   - how to backup the DB
   - how to export all apply packets for the week



-----



Prompt 14 - GitHub, Organized Readme, Deploy to Vercel

Publish to github, remain organized by keeping a file system that is attractive to employers, create a great ReadMe, and then help me deploy this whole thing to Vercel
