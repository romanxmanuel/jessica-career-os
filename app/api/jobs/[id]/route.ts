import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobs, resumeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { computeFitScore } from "@/lib/scoring/fit-score";
import { extractSkills, extractIsRemote, extractSalary } from "@/lib/scoring/keywords";

const UpdateJobSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  url: z.string().optional(),
  rawJd: z.string().optional(), // if provided, re-scores automatically
  status: z.enum(["new", "queued", "applying", "applied", "archived"]).optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const now = new Date();
  const updatePayload: Record<string, unknown> = { ...parsed.data, updatedAt: now };

  // If rawJd changed, re-run fit scoring automatically
  if (parsed.data.rawJd) {
    const existing = await db.select().from(jobs).where(eq(jobs.id, id)).get();
    const defaultResume = await db
      .select()
      .from(resumeProfiles)
      .where(eq(resumeProfiles.isDefault, true))
      .get();

    if (existing && defaultResume) {
      const newJd = parsed.data.rawJd;
      const parsedSkills = extractSkills(newJd);
      const remote = parsed.data.remote ?? existing.remote ?? extractIsRemote(newJd);
      const salary = extractSalary(newJd);

      const breakdown = computeFitScore({
        jobTitle: parsed.data.title ?? existing.title,
        rawJd: newJd,
        resumeHeadline: defaultResume.headline ?? existing.title,
        resumeSkills: JSON.parse(defaultResume.skills ?? "[]"),
        resumeYearsExp: defaultResume.yearsExperience ?? 10,
        targetRoleLevel: defaultResume.targetRoleLevel ?? "mid",
        jobRemote: remote,
        jobLocation: parsed.data.location ?? existing.location ?? undefined,
        jobSalaryMin: salary.min,
        jobSalaryMax: salary.max,
      });

      updatePayload.parsedSkills = JSON.stringify(parsedSkills);
      updatePayload.fitScore = breakdown.total;
      updatePayload.fitBreakdown = JSON.stringify(breakdown);
      if (salary.min) updatePayload.salaryMin = salary.min;
      if (salary.max) updatePayload.salaryMax = salary.max;
    }
  }

  await db.update(jobs).set(updatePayload).where(eq(jobs.id, id)).run();

  const updated = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(jobs).where(eq(jobs.id, id)).run();
  return NextResponse.json({ success: true });
}
