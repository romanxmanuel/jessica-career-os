// POST /api/jobs/discover
// Finds new AR Specialist jobs via JSearch API, deduplicates against DB,
// auto-scores each against Jessica's default resume, and inserts them.
// Requires RAPIDAPI_KEY in .env.local.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, resumeProfiles } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { searchARJobs } from "@/lib/discovery/jsearch";
import { computeFitScore } from "@/lib/scoring/fit-score";
import { extractSkills, extractIsRemote, extractSalary } from "@/lib/scoring/keywords";

export async function POST(_req: NextRequest) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY not configured. Add it to your .env.local file to enable job discovery." },
      { status: 503 }
    );
  }

  // Fetch jobs from JSearch
  let discovered;
  try {
    discovered = await searchARJobs(apiKey);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Job search failed: ${message}` }, { status: 502 });
  }

  if (discovered.length === 0) {
    return NextResponse.json({ found: 0, added: 0, skipped: 0, jobs: [] });
  }

  // Get all existing job URLs from DB to deduplicate
  const existingJobs = db.select({ url: jobs.url }).from(jobs).all();
  const existingUrls = new Set(existingJobs.map((j) => j.url).filter(Boolean));

  // Load default resume for scoring
  const defaultResume = db
    .select()
    .from(resumeProfiles)
    .where(eq(resumeProfiles.isDefault, true))
    .get();

  const resumeSkills: string[] = defaultResume ? JSON.parse(defaultResume.skills ?? "[]") : [];

  const now = new Date();
  const newJobs = [];

  for (const jJob of discovered) {
    const applyUrl = jJob.job_apply_link ?? null;

    // Skip if we already have this URL
    if (applyUrl && existingUrls.has(applyUrl)) continue;

    const location =
      [jJob.job_city, jJob.job_state].filter(Boolean).join(", ") || null;

    const rawJd = jJob.job_description ?? "";
    const parsedSkills = extractSkills(rawJd);
    const remote = jJob.job_is_remote ?? extractIsRemote(rawJd);
    const salaryFromText = extractSalary(rawJd);
    const salaryMin = jJob.job_min_salary ?? salaryFromText.min;
    const salaryMax = jJob.job_max_salary ?? salaryFromText.max;

    // Compute fit score
    let fitScore: number | null = null;
    let fitBreakdown: string | null = null;

    if (defaultResume) {
      const breakdown = computeFitScore({
        jobTitle: jJob.job_title,
        rawJd,
        resumeHeadline: defaultResume.headline ?? "Accounts Receivable Specialist",
        resumeSkills,
        resumeYearsExp: defaultResume.yearsExperience ?? 10,
        targetRoleLevel: defaultResume.targetRoleLevel ?? "mid",
        jobRemote: remote,
        jobLocation: location ?? undefined,
        jobSalaryMin: salaryMin,
        jobSalaryMax: salaryMax,
      });
      fitScore = breakdown.total;
      fitBreakdown = JSON.stringify(breakdown);
    }

    const id = createId();

    db.insert(jobs)
      .values({
        id,
        title: jJob.job_title,
        company: jJob.employer_name,
        location,
        remote,
        url: applyUrl,
        rawJd,
        parsedSkills: JSON.stringify(parsedSkills),
        fitScore,
        fitBreakdown,
        salaryMin,
        salaryMax,
        status: "new",
        notes: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    newJobs.push({ id, fitScore, title: jJob.job_title, company: jJob.employer_name });

    // Track this URL so we don't double-insert within same batch
    if (applyUrl) existingUrls.add(applyUrl);
  }

  // Return full job records for the newly inserted jobs
  const insertedIds = newJobs.map((j) => j.id);
  const insertedJobs =
    insertedIds.length > 0
      ? db.select().from(jobs).where(inArray(jobs.id, insertedIds)).all()
      : [];

  // Sort by fit score descending
  insertedJobs.sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0));

  return NextResponse.json({
    found: discovered.length,
    added: newJobs.length,
    skipped: discovered.length - newJobs.length,
    jobs: insertedJobs,
  });
}
