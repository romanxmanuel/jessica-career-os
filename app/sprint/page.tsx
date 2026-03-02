import { db } from "@/lib/db";
import { applications, jobs, followUps, dailySprints } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Calendar, FileText, Send, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { relativeDate } from "@/lib/utils";
import { FollowUpActions } from "./follow-up-actions";
import { createId } from "@paralleldrive/cuid2";

export const dynamic = "force-dynamic";

async function getTodayData() {
  const today = new Date().toISOString().split("T")[0];

  // Get or create today's sprint
  let sprint = db
    .select()
    .from(dailySprints)
    .where(eq(dailySprints.date, today))
    .get();

  if (!sprint) {
    const now = new Date();
    db.insert(dailySprints)
      .values({
        id: createId(),
        date: today,
        goalCount: 5,
        completedCount: 0,
        createdAt: now,
      })
      .run();
    sprint = db
      .select()
      .from(dailySprints)
      .where(eq(dailySprints.date, today))
      .get()!;
  }

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Overdue + due today follow-ups
  const dueFollowUps = db
    .select({
      id: followUps.id,
      type: followUps.type,
      dueDate: followUps.dueDate,
      status: followUps.status,
      message: followUps.message,
      applicationId: followUps.applicationId,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
      jobId: jobs.id,
    })
    .from(followUps)
    .leftJoin(applications, eq(followUps.applicationId, applications.id))
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(lte(followUps.dueDate, endOfDay), eq(followUps.status, "pending")))
    .all();

  // Packets needing human review
  const reviewQueue = db
    .select({
      appId: applications.id,
      jobId: applications.jobId,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
      jobFitScore: jobs.fitScore,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(eq(applications.status, "human_review"))
    .all();

  // Top queued jobs to apply to today
  const queuedJobs = db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "queued"))
    .all()
    .sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0))
    .slice(0, 5);

  return { sprint, dueFollowUps, reviewQueue, queuedJobs };
}

export default async function SprintPage() {
  const { sprint, dueFollowUps, reviewQueue, queuedJobs } = await getTodayData();

  const totalTasks = dueFollowUps.length + reviewQueue.length;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Daily Sprint
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {sprint?.completedCount ?? 0}/{sprint?.goalCount ?? 5}
          </div>
          <p className="text-xs text-muted-foreground">Applications today</p>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto pb-1">
        {["Intake", "Score", "Generate", "Review", "Submit", "Follow-up"].map((step, i) => (
          <span key={step} className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-1 rounded bg-muted font-medium">{step}</span>
            {i < 5 && <ArrowRight className="w-3 h-3" />}
          </span>
        ))}
      </div>

      {totalTasks === 0 && queuedJobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
            <p className="font-medium">Sprint complete! No pending tasks.</p>
            <Link href="/jobs/new">
              <Button size="sm">Add more jobs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Follow-ups */}
          {dueFollowUps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Follow-ups Due
                  <Badge variant="warning">{dueFollowUps.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dueFollowUps.map((fu) => (
                  <div
                    key={fu.id}
                    className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{fu.jobCompany} — {fu.jobTitle}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {fu.type.replace("_", " ")} · {relativeDate(fu.dueDate)}
                      </p>
                      {fu.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                          "{fu.message.slice(0, 100)}..."
                        </p>
                      )}
                    </div>
                    <FollowUpActions followUpId={fu.id} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Review Queue */}
          {reviewQueue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Needs Your Review
                  <Badge variant="warning">{reviewQueue.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {reviewQueue.map((item) => (
                  <Link
                    key={item.appId}
                    href={`/jobs/${item.jobId}/packet/${item.appId}`}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-1 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{item.jobCompany}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.jobFitScore != null && (
                        <span className="text-xs font-semibold text-blue-700">
                          {item.jobFitScore}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Today's Application Queue */}
          {queuedJobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Apply Today
                  <Badge variant="info">{queuedJobs.length} queued</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {queuedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-1 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.fitScore != null && (
                        <span
                          className={`text-sm font-bold ${
                            job.fitScore >= 80
                              ? "text-green-700"
                              : job.fitScore >= 65
                              ? "text-blue-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {job.fitScore}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
