import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { followUps, applications, jobs } from "@/db/schema";
import { eq, lte, asc } from "drizzle-orm";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dueToday = searchParams.get("due_today");

  if (dueToday === "true") {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const due = db
      .select({
        id: followUps.id,
        applicationId: followUps.applicationId,
        dueDate: followUps.dueDate,
        type: followUps.type,
        status: followUps.status,
        message: followUps.message,
        jobTitle: jobs.title,
        jobCompany: jobs.company,
      })
      .from(followUps)
      .leftJoin(applications, eq(followUps.applicationId, applications.id))
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .where(lte(followUps.dueDate, endOfDay))
      .orderBy(asc(followUps.dueDate))
      .all();

    return NextResponse.json(due.filter((f) => f.status === "pending"));
  }

  const all = db
    .select({
      id: followUps.id,
      applicationId: followUps.applicationId,
      dueDate: followUps.dueDate,
      type: followUps.type,
      status: followUps.status,
      message: followUps.message,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
    })
    .from(followUps)
    .leftJoin(applications, eq(followUps.applicationId, applications.id))
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .orderBy(asc(followUps.dueDate))
    .all();

  return NextResponse.json(all);
}

const UpdateFollowUpSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "sent", "skipped"]),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parsed = UpdateFollowUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  db.update(followUps)
    .set({ status: parsed.data.status })
    .where(eq(followUps.id, parsed.data.id))
    .run();

  return NextResponse.json({ success: true });
}
