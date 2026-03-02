import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, jobs, followUps } from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

export async function GET() {
  const allApps = db.select().from(applications).all();
  const allJobs = db.select().from(jobs).all();

  const total = allApps.length;
  const submitted = allApps.filter((a) =>
    ["submitted", "interviewing", "offer", "rejected", "ghosted"].includes(
      a.status ?? ""
    )
  ).length;
  const interviewing = allApps.filter((a) =>
    ["interviewing", "offer"].includes(a.status ?? "")
  ).length;
  const offers = allApps.filter((a) => a.status === "offer").length;
  const inReview = allApps.filter((a) => a.status === "human_review").length;
  const drafts = allApps.filter((a) => a.status === "draft").length;
  const queued = allJobs.filter((j) => j.status === "queued").length;
  const newJobs = allJobs.filter((j) => j.status === "new").length;

  const responseRate =
    submitted > 0 ? Math.round((interviewing / submitted) * 100) : 0;

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const overdueFollowUps = db
    .select()
    .from(followUps)
    .where(and(lte(followUps.dueDate, endOfDay), eq(followUps.status, "pending")))
    .all();

  return NextResponse.json({
    total,
    submitted,
    inReview,
    drafts,
    interviewing,
    offers,
    responseRate,
    queued,
    newJobs,
    overdueFollowUps: overdueFollowUps.length,
  });
}
