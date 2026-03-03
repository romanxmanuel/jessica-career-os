import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, jobs, resumeProfiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { addDays } from "date-fns";
import { followUps } from "@/db/schema";

const CreateApplicationSchema = z.object({
  jobId: z.string().min(1),
  resumeId: z.string().optional(),
});

export async function GET() {
  const all = await db
    .select({
      id: applications.id,
      jobId: applications.jobId,
      resumeId: applications.resumeId,
      status: applications.status,
      humanApprovedAt: applications.humanApprovedAt,
      submittedAt: applications.submittedAt,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
      jobFitScore: jobs.fitScore,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(desc(applications.createdAt))
    .all();

  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const now = new Date();
  const id = createId();

  // Get default resume if none specified
  let resumeId = parsed.data.resumeId;
  if (!resumeId) {
    const def = await db
      .select()
      .from(resumeProfiles)
      .where(eq(resumeProfiles.isDefault, true))
      .get();
    resumeId = def?.id;
  }

  await db.insert(applications)
    .values({
      id,
      jobId: parsed.data.jobId,
      resumeId: resumeId ?? null,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  // Update job status to "applying"
  await db.update(jobs)
    .set({ status: "applying", updatedAt: now })
    .where(eq(jobs.id, parsed.data.jobId))
    .run();

  // Auto-schedule follow-ups
  const followUpTypes: Array<{ type: string; days: number }> = [
    { type: "week1", days: 7 },
    { type: "week2", days: 14 },
  ];

  for (const fu of followUpTypes) {
    await db.insert(followUps)
      .values({
        id: createId(),
        applicationId: id,
        dueDate: addDays(now, fu.days),
        type: fu.type,
        status: "pending",
        createdAt: now,
      })
      .run();
  }

  const newApp = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get();

  return NextResponse.json(newApp, { status: 201 });
}
