// /dashboard — KPI metrics, weekly trends, keyword insights, and weekly review.
// Pure server component — all data fetched from SQLite at render time.

import { db } from "@/lib/db";
import { applications, jobs, followUps } from "@/db/schema";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Send,
  MessageSquare,
  BarChart2,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Target,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ── Date helpers ──────────────────────────────────────────────────────────────
function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function startOfWeek(d: Date) {
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon start
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function weekLabel(weekStart: Date) {
  return weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function getDashboardData() {
  const allApps = db.select().from(applications).all();
  const allJobs = db.select().from(jobs).all();
  const allFollowUps = db.select().from(followUps).all();

  const now = new Date();
  const d7 = daysAgo(7);
  const d14 = daysAgo(14);
  const d30 = daysAgo(30);

  // Applications "submitted" means any terminal status (submitted/interviewing/offer/rejected/ghosted)
  const submittedStatuses = ["submitted", "interviewing", "offer", "rejected", "ghosted"];
  const positiveStatuses = ["interviewing", "offer"];

  function submittedInWindow(start: Date) {
    return allApps.filter(
      (a) =>
        submittedStatuses.includes(a.status ?? "") &&
        a.submittedAt != null &&
        a.submittedAt >= start
    );
  }

  const apps7 = submittedInWindow(d7);
  const apps14 = submittedInWindow(d14);
  const apps30 = submittedInWindow(d30);
  const appsAll = allApps.filter((a) => submittedStatuses.includes(a.status ?? ""));

  function responseRate(apps: typeof allApps) {
    if (apps.length === 0) return 0;
    const replies = apps.filter((a) => positiveStatuses.includes(a.status ?? "")).length;
    return Math.round((replies / apps.length) * 100);
  }

  function interviewRate(apps: typeof allApps) {
    if (apps.length === 0) return 0;
    const interviews = apps.filter((a) =>
      ["interviewing", "offer"].includes(a.status ?? "")
    ).length;
    return Math.round((interviews / apps.length) * 100);
  }

  // Follow-ups sent in last 30 days
  const followUpsSent = allFollowUps.filter(
    (f) => f.status === "sent" && f.createdAt >= d30
  ).length;

  // ── 4-week bar chart data ─────────────────────────────────────────────────
  const weeks: { label: string; count: number }[] = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = startOfWeek(new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const count = allApps.filter(
      (a) =>
        submittedStatuses.includes(a.status ?? "") &&
        a.submittedAt != null &&
        a.submittedAt >= weekStart &&
        a.submittedAt < weekEnd
    ).length;
    weeks.push({ label: w === 0 ? "This week" : weekLabel(weekStart), count });
  }

  // ── Role type breakdown ───────────────────────────────────────────────────
  const jobMap: Record<string, string> = {};
  for (const j of allJobs) jobMap[j.id] = j.title.toLowerCase();

  function classifyRole(title: string) {
    if (/\b(hr|human resources|people ops|shrm|talent|payroll|onboard)\b/i.test(title)) return "HR Operations";
    if (/\b(ar|accounts receivable|billing|collections|credit|revenue cycle)\b/i.test(title)) return "AR / Billing";
    return "Other";
  }

  const roleCounts: Record<string, { applied: number; replied: number }> = {
    "AR / Billing": { applied: 0, replied: 0 },
    "HR Operations": { applied: 0, replied: 0 },
    "Other": { applied: 0, replied: 0 },
  };

  for (const a of appsAll) {
    const title = jobMap[a.jobId ?? ""] ?? "";
    const role = classifyRole(title);
    roleCounts[role].applied++;
    if (positiveStatuses.includes(a.status ?? "")) roleCounts[role].replied++;
  }

  // ── Keyword correlation ───────────────────────────────────────────────────
  // Find skills in jobs that got replies vs didn't
  const repliedJobIds = appsAll
    .filter((a) => positiveStatuses.includes(a.status ?? ""))
    .map((a) => a.jobId)
    .filter(Boolean) as string[];

  const noReplyJobIds = appsAll
    .filter(
      (a) =>
        ["rejected", "ghosted"].includes(a.status ?? "") &&
        !repliedJobIds.includes(a.jobId ?? "")
    )
    .map((a) => a.jobId)
    .filter(Boolean) as string[];

  function collectSkills(jobIds: string[]) {
    const freq: Record<string, number> = {};
    for (const job of allJobs) {
      if (!jobIds.includes(job.id)) continue;
      try {
        const skills: string[] = JSON.parse(job.parsedSkills ?? "[]");
        for (const s of skills) freq[s] = (freq[s] ?? 0) + 1;
      } catch {
        // ignore parse error
      }
    }
    return freq;
  }

  const repliedSkills = collectSkills(repliedJobIds);
  const noReplySkills = collectSkills(noReplyJobIds);

  // Rank skills by (replied_count - noReply_count / (noReply_count+1))
  const allSkillKeys = new Set([...Object.keys(repliedSkills), ...Object.keys(noReplySkills)]);
  const skillRanking = Array.from(allSkillKeys)
    .map((s) => ({
      skill: s,
      repliedCount: repliedSkills[s] ?? 0,
      noReplyCount: noReplySkills[s] ?? 0,
      score: (repliedSkills[s] ?? 0) - (noReplySkills[s] ?? 0) * 0.3,
    }))
    .filter((s) => s.repliedCount > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // ── Weekly Review bullets ─────────────────────────────────────────────────
  const reviewBullets: string[] = [];
  const totalSubmitted = appsAll.length;
  const totalReplied = appsAll.filter((a) => positiveStatuses.includes(a.status ?? "")).length;
  const rr = totalSubmitted > 0 ? (totalReplied / totalSubmitted) * 100 : 0;
  const queued = allJobs.filter((j) => j.status === "queued").length;
  const pendingFollowUps = allFollowUps.filter(
    (f) => f.status === "pending" && f.dueDate <= now
  ).length;
  const packetReady = allApps.filter((a) => a.status === "human_review").length;

  if (pendingFollowUps > 0) {
    reviewBullets.push(
      `Send your ${pendingFollowUps} overdue follow-up${pendingFollowUps > 1 ? "s" : ""} first thing — following up triples reply rates.`
    );
  }

  if (rr < 15 && totalSubmitted >= 5) {
    reviewBullets.push(
      "Your response rate is below 15%. Try tweaking your cover letter's first paragraph to open with a specific company detail."
    );
  } else if (rr >= 20) {
    reviewBullets.push(
      `Great response rate (${Math.round(rr)}%)! Keep applying to similar roles — your profile is resonating.`
    );
  }

  if (queued >= 3) {
    reviewBullets.push(
      `You have ${queued} jobs queued. Go to Today's Hunt and click "Build All Packets" to prepare them in one click.`
    );
  } else if (queued === 0 && totalSubmitted < 10) {
    reviewBullets.push(
      "Your queue is empty — use Today's Hunt to find new AR Specialist openings in Central Florida."
    );
  }

  if (packetReady > 0) {
    reviewBullets.push(
      `${packetReady} packet${packetReady > 1 ? "s are" : " is"} waiting for your review. Open My Applications to review and submit.`
    );
  }

  if (reviewBullets.length < 3) {
    reviewBullets.push(
      "Apply to at least 5 jobs per week to maximize your chances — consistency beats perfection."
    );
  }

  return {
    periods: {
      "7 days": { submitted: apps7.length, responseRate: responseRate(apps7), interviewRate: interviewRate(apps7) },
      "14 days": { submitted: apps14.length, responseRate: responseRate(apps14), interviewRate: interviewRate(apps14) },
      "30 days": { submitted: apps30.length, responseRate: responseRate(apps30), interviewRate: interviewRate(apps30) },
    },
    followUpsSent,
    weeks,
    roleCounts,
    skillRanking,
    reviewBullets,
    totalSubmitted,
  };
}

// ── Components ────────────────────────────────────────────────────────────────

function MiniBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-6 text-right">{value}</span>
    </div>
  );
}

function WeekBar({ count, max, label }: { count: number; max: number; label: string }) {
  const pct = max === 0 ? 0 : (count / max) * 100;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-sm font-bold text-foreground">{count}</span>
      <div className="w-full flex flex-col justify-end" style={{ height: "64px" }}>
        <div
          className="w-full bg-primary rounded-t transition-all"
          style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const data = await getDashboardData();
  const { periods, followUpsSent, weeks, roleCounts, skillRanking, reviewBullets, totalSubmitted } = data;

  const maxWeek = Math.max(...weeks.map((w) => w.count), 1);
  const maxRole = Math.max(...Object.values(roleCounts).map((r) => r.applied), 1);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">How I&apos;m Doing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalSubmitted === 0
              ? "Start applying to see your metrics here."
              : `${totalSubmitted} total application${totalSubmitted !== 1 ? "s" : ""} tracked.`}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowRight className="w-3.5 h-3.5" />
            Back to Overview
          </Button>
        </Link>
      </div>

      {/* ── Time-period KPIs ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          Applications by Time Period
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {(["7 days", "14 days", "30 days"] as const).map((period) => {
            const p = periods[period];
            return (
              <Card key={period} className="p-4">
                <p className="text-xs text-muted-foreground font-medium mb-3">Last {period}</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-muted-foreground">Applied</span>
                      <span className="text-2xl font-bold">{p.submitted}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-muted-foreground">Response Rate</span>
                      <span className="text-sm font-semibold">{p.responseRate}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div
                        className={`h-full rounded-full ${p.responseRate >= 20 ? "bg-green-500" : p.responseRate >= 10 ? "bg-yellow-500" : "bg-muted-foreground/40"}`}
                        style={{ width: `${Math.min(p.responseRate * 3, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-muted-foreground">Interview Rate</span>
                      <span className="text-sm font-semibold">{p.interviewRate}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full">
                      <div
                        className={`h-full rounded-full ${p.interviewRate >= 10 ? "bg-green-500" : "bg-muted-foreground/40"}`}
                        style={{ width: `${Math.min(p.interviewRate * 5, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Follow-ups */}
        <Card className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{followUpsSent}</p>
            <p className="text-xs text-muted-foreground">Follow-up messages sent in the last 30 days</p>
          </div>
          {followUpsSent === 0 && (
            <Link href="/sprint" className="ml-auto">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Send className="w-3 h-3" />
                Send follow-ups
              </Button>
            </Link>
          )}
        </Card>
      </section>

      {/* ── 4-Week Chart ──────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Applications per Week
        </h2>
        <Card className="p-5">
          <div className="flex items-end gap-4 h-24">
            {weeks.map((w, i) => (
              <WeekBar key={i} count={w.count} max={maxWeek} label={w.label} />
            ))}
          </div>
          {weeks.every((w) => w.count === 0) && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              No applications submitted yet — chart will fill in as you apply.
            </p>
          )}
        </Card>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Role Type Breakdown ───────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Target className="w-4 h-4" />
            Performance by Role Type
          </h2>
          <Card className="p-4 space-y-4">
            {Object.entries(roleCounts).map(([role, stats]) => (
              <div key={role} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium">{role}</span>
                  <span className="text-xs text-muted-foreground">
                    {stats.applied} applied · {stats.replied} replied
                  </span>
                </div>
                <MiniBar
                  value={stats.applied}
                  max={maxRole}
                  color={role === "AR / Billing" ? "bg-primary" : "bg-purple-500"}
                />
                {stats.applied > 0 && (
                  <div className="flex justify-end">
                    <Badge
                      variant={stats.replied > 0 ? "success" : "secondary"}
                      className="text-[10px]"
                    >
                      {stats.replied > 0
                        ? `${Math.round((stats.replied / stats.applied) * 100)}% reply rate`
                        : "No replies yet"}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
            {Object.values(roleCounts).every((r) => r.applied === 0) && (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </Card>
        </section>

        {/* ── Keyword Correlation ───────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Skills in Jobs That Replied
          </h2>
          <Card className="p-4">
            {skillRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Once you have some replies, we&apos;ll show which skills those jobs had in common.
              </p>
            ) : (
              <div className="space-y-2">
                {skillRanking.map((s) => (
                  <div key={s.skill} className="flex items-center gap-3">
                    <span className="text-xs text-foreground capitalize w-36 shrink-0 truncate">
                      {s.skill}
                    </span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${Math.min((s.repliedCount / Math.max(...skillRanking.map(r => r.repliedCount))) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right">{s.repliedCount}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  These skills appeared in jobs that responded to your applications.
                </p>
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* ── Weekly Review ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          This Week&apos;s Action Plan
        </h2>
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-card border-purple-100 dark:border-purple-900">
          <div className="space-y-3">
            {reviewBullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground leading-relaxed">{bullet}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2 flex-wrap">
            <Link href="/hunt">
              <Button size="sm" className="gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Today&apos;s Hunt
              </Button>
            </Link>
            <Link href="/sprint">
              <Button size="sm" variant="outline" className="gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Send Follow-ups
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* ── Benchmarks ────────────────────────────────────────────────────── */}
      <section>
        <Card className="p-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground mb-1">Industry Benchmarks (AR / Finance roles)</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Average response rate: 10–20% (any reply)</li>
                <li>• Average interview rate: 5–15% of applications</li>
                <li>• Follow-up message reply rate: 15–25% when sent within 7 days</li>
                <li>• Apply to 10–20 jobs/week to see consistent interview activity</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
