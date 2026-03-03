import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateApplicationSchema = z.object({
  status: z
    .enum([
      "draft",
      "human_review",
      "submitted",
      "interviewing",
      "offer",
      "rejected",
      "ghosted",
    ])
    .optional(),
  coverLetter: z.string().optional(),
  tailoredResume: z.string().optional(),
  screeningQa: z.string().optional(),
  outreachMessage: z.string().optional(),
  // Only set by the human approval action
  humanApprove: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get();
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(app);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const now = new Date();
  const { humanApprove, ...fields } = parsed.data;

  const updateData: Record<string, unknown> = {
    ...fields,
    updatedAt: now,
  };

  // Human approval gate: only this action can set submittedAt and status=submitted
  if (humanApprove === true) {
    const app = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .get();

    if (!app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Guard: must have a cover letter before marking submitted
    const coverLetter = fields.coverLetter ?? app.coverLetter;
    if (!coverLetter || coverLetter.trim().length < 20) {
      return NextResponse.json(
        { error: "Please generate or write a cover letter before marking this application as submitted." },
        { status: 400 }
      );
    }

    updateData.humanApprovedAt = now;
    updateData.submittedAt = now;
    updateData.status = "submitted";

    // Update job status to "applied"
    await db.update(jobs)
      .set({ status: "applied", updatedAt: now })
      .where(eq(jobs.id, app.jobId))
      .run();
  }

  await db.update(applications).set(updateData).where(eq(applications.id, id)).run();

  const updated = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get();
  return NextResponse.json(updated);
}
