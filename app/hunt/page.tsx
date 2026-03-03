// /hunt — Today's Job Hunt
// Server component: loads queued jobs + application status, then renders client UI.

import { db } from "@/lib/db";
import { jobs, applications } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { HuntClient } from "./hunt-client";

export const dynamic = "force-dynamic";

export default async function HuntPage() {
  // Load all queued jobs, sorted by fit score
  const queuedJobs = (await db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "queued"))
    .all())
    .sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0));

  // Load existing applications for queued jobs to know packet status
  const queuedIds = queuedJobs.map((j) => j.id);
  const existingApps =
    queuedIds.length > 0
      ? await db
          .select()
          .from(applications)
          .where(inArray(applications.jobId, queuedIds))
          .all()
      : [];

  // Build a map: jobId → { appId, hasPacket }
  const appMap: Record<string, { appId: string; hasPacket: boolean }> = {};
  for (const app of existingApps) {
    // Prefer the most complete application
    const existing = appMap[app.jobId];
    const hasPacket = !!(app.coverLetter && app.tailoredResume);
    if (!existing || (hasPacket && !existing.hasPacket)) {
      appMap[app.jobId] = { appId: app.id, hasPacket };
    }
  }

  const apiKeyConfigured = !!process.env.RAPIDAPI_KEY;

  return (
    <HuntClient
      initialQueuedJobs={queuedJobs}
      appMap={appMap}
      apiKeyConfigured={apiKeyConfigured}
    />
  );
}
