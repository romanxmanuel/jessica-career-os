import { db } from "@/lib/db";
import { applications, jobs, followUps } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Send,
  Briefcase,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  Plus,
  Bell,
  Star,
} from "lucide-react";
import Link from "next/link";
import { formatDate, relativeDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const allApps = await db.select().from(applications).all();
  const allJobs = await db.select().from(jobs).all();

  const submitted = allApps.filter((a) =>
    ["submitted", "interviewing", "offer", "rejected", "ghosted"].includes(
      a.status ?? ""
    )
  ).length;
  const interviewing = allApps.filter((a) =>
    ["interviewing", "offer"].includes(a.status ?? "")
  ).length;
  const inReview = allApps.filter((a) => a.status === "human_review").length;
  const queued = allJobs.filter((j) => j.status === "queued").length;
  const responseRate =
    submitted > 0 ? Math.round((interviewing / submitted) * 100) : 0;

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const dueFollowUps = await db
    .select({
      id: followUps.id,
      type: followUps.type,
      dueDate: followUps.dueDate,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
    })
    .from(followUps)
    .leftJoin(applications, eq(followUps.applicationId, applications.id))
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(lte(followUps.dueDate, endOfDay), eq(followUps.status, "pending")))
    .all();

  const topJobs = (await db
    .select()
    .from(jobs)
    .where(eq(jobs.status, "queued"))
    .all())
    .sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0))
    .slice(0, 3);

  const recentApps = (await db
    .select({
      id: applications.id,
      status: applications.status,
      updatedAt: applications.updatedAt,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .all())
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0))
    .slice(0, 4);

  return {
    submitted,
    interviewing,
    inReview,
    queued,
    responseRate,
    dueFollowUps,
    topJobs,
    recentApps,
  };
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant:
      | "default"
      | "success"
      | "warning"
      | "info"
      | "danger"
      | "secondary"
      | "outline";
  }
> = {
  draft: { label: "Draft", variant: "secondary" },
  human_review: { label: "Needs Review", variant: "warning" },
  submitted: { label: "Submitted", variant: "info" },
  interviewing: { label: "Interviewing! 🎉", variant: "success" },
  offer: { label: "Got an Offer!", variant: "success" },
  rejected: { label: "No Match", variant: "danger" },
  ghosted: { label: "No Reply Yet", variant: "secondary" },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const {
    submitted,
    interviewing,
    inReview,
    queued,
    responseRate,
    dueFollowUps,
    topJobs,
    recentApps,
  } = await getStats();

  const greeting = getGreeting();
  const hasAnyData = submitted > 0 || queued > 0 || recentApps.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, Jessica! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {dueFollowUps.length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                · {dueFollowUps.length} message
                {dueFollowUps.length !== 1 ? "s" : ""} to send today
              </span>
            )}
          </p>
        </div>
        <Link href="/sprint">
          <Button size="sm" className="gap-2">
            <Zap className="w-4 h-4" />
            Start My Day
          </Button>
        </Link>
      </div>

      {/* Empty state for brand new users */}
      {!hasAnyData && (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                Ready to start your job search?
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Start by adding a job posting you found online. It only takes a
                minute!
              </p>
            </div>
            <Link href="/jobs/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add My First Job Posting
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Jobs Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{submitted}</span>
              <Send className="w-5 h-5 text-muted-foreground mb-1.5" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {submitted === 0
                ? "No applications yet"
                : submitted === 1
                ? "1 job applied to"
                : `${submitted} jobs applied to`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Interviews Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{interviewing}</span>
              <TrendingUp className="w-5 h-5 text-muted-foreground mb-1.5" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {interviewing === 0
                ? "Keep applying!"
                : `${interviewing} in progress 🎉`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">{responseRate}%</span>
              <CheckCircle2 className="w-5 h-5 text-muted-foreground mb-1.5" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {submitted === 0
                ? "No data yet"
                : interviewing === 1
                ? "1 company replied"
                : `${interviewing} companies replied`}
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            inReview > 0
              ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
              : ""
          }
        >
          <CardHeader className="pb-1">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Ready to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span
                className={`text-4xl font-bold ${
                  inReview > 0 ? "text-amber-600" : ""
                }`}
              >
                {inReview}
              </span>
              <Clock
                className={`w-5 h-5 mb-1.5 ${
                  inReview > 0 ? "text-amber-500" : "text-muted-foreground"
                }`}
              />
            </div>
            {inReview > 0 ? (
              <Link href="/tracker">
                <p className="text-xs text-amber-600 hover:underline mt-1 font-medium">
                  Review now →
                </p>
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Nothing waiting
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Follow-ups Due */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="w-4 h-4 text-amber-500" />
                Messages to Send Today
              </CardTitle>
              {dueFollowUps.length > 0 && (
                <Badge variant="warning">{dueFollowUps.length} due</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {dueFollowUps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up! No messages due today.
              </p>
            ) : (
              <div className="space-y-2">
                {dueFollowUps.slice(0, 4).map((fu) => (
                  <div
                    key={fu.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{fu.jobCompany}</p>
                      <p className="text-xs text-muted-foreground">
                        {fu.jobTitle} · follow up {relativeDate(fu.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/sprint" className="block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1 text-primary"
                  >
                    Go Send Messages <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Queued Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="w-4 h-4 text-primary" />
                Best Jobs to Apply to Next
              </CardTitle>
              {queued > 0 && (
                <Badge variant="info">{queued} waiting</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {topJobs.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No jobs in your list yet. Add a job posting to get started!
                </p>
                <Link href="/jobs/new">
                  <Button size="sm" variant="outline" className="w-full gap-1">
                    <Plus className="w-3 h-3" />
                    Add a Job Posting
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {topJobs.map((job) => (
                  <Link href={`/jobs/${job.id}`} key={job.id} className="block">
                    <div className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-muted/50 rounded px-2 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.company}
                        </p>
                      </div>
                      {job.fitScore != null && (
                        <span
                          className={`text-sm font-bold px-2 py-0.5 rounded ${
                            job.fitScore >= 80
                              ? "bg-green-100 text-green-700"
                              : job.fitScore >= 65
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {job.fitScore}%
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
                <Link href="/jobs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1 text-primary"
                  >
                    See All Jobs <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {recentApps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where I Applied Recently</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentApps.map((app) => {
                const cfg = STATUS_CONFIG[app.status ?? "draft"];
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{app.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.jobCompany} · {formatDate(app.updatedAt)}
                      </p>
                    </div>
                    <Badge variant={cfg?.variant ?? "secondary"}>
                      {cfg?.label ?? app.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
