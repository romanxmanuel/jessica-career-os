import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, resumeProfiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { computeFitScore } from "@/lib/scoring/fit-score";
import { extractSkills, extractIsRemote, extractSalary } from "@/lib/scoring/keywords";

const CreateJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  url: z.string().url().optional().or(z.literal("")),
  rawJd: z.string().min(10),
  notes: z.string().optional(),
});

export async function GET() {
  const allJobs = db
    .select()
    .from(jobs)
    .orderBy(desc(jobs.createdAt))
    .all();

  return NextResponse.json(allJobs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const data = parsed.data;

  // Auto-extract skills and remote flag from JD
  const parsedSkills = extractSkills(data.rawJd);
  const remote = data.remote ?? extractIsRemote(data.rawJd);
  const salary = extractSalary(data.rawJd);

  const now = new Date();
  const id = createId();

  // Compute initial fit score using default resume
  const defaultResume = db
    .select()
    .from(resumeProfiles)
    .where(eq(resumeProfiles.isDefault, true))
    .get();

  let fitScore: number | undefined;
  let fitBreakdown: object | undefined;

  if (defaultResume) {
    const breakdown = computeFitScore({
      jobTitle: data.title,
      rawJd: data.rawJd,
      resumeHeadline: defaultResume.headline ?? data.title,
      resumeSkills: JSON.parse(defaultResume.skills ?? "[]"),
      resumeYearsExp: defaultResume.yearsExperience ?? 5,
      targetRoleLevel: defaultResume.targetRoleLevel ?? "senior",
      jobRemote: remote,
      jobLocation: data.location,
      jobSalaryMin: salary.min,
      jobSalaryMax: salary.max,
    });
    fitScore = breakdown.total;
    fitBreakdown = breakdown;
  }

  db.insert(jobs)
    .values({
      id,
      title: data.title,
      company: data.company,
      location: data.location ?? null,
      remote,
      url: data.url || null,
      rawJd: data.rawJd,
      parsedSkills: JSON.stringify(parsedSkills),
      fitScore: fitScore ?? null,
      fitBreakdown: fitBreakdown ? JSON.stringify(fitBreakdown) : null,
      salaryMin: salary.min,
      salaryMax: salary.max,
      status: "new",
      notes: data.notes ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const newJob = db.select().from(jobs).where(eq(jobs.id, id)).get();
  return NextResponse.json(newJob, { status: 201 });
}
