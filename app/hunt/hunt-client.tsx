"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Plus,
  SkipForward,
  Loader2,
  Zap,
  AlertCircle,
  MapPin,
  Building2,
  DollarSign,
} from "lucide-react";
import type { Job } from "@/db/schema";

interface AppInfo {
  appId: string;
  hasPacket: boolean;
}

interface HuntClientProps {
  initialQueuedJobs: Job[];
  appMap: Record<string, AppInfo>;
  apiKeyConfigured: boolean;
}

interface DiscoverResult {
  found: number;
  added: number;
  skipped: number;
  jobs: Job[];
}

function scoreColor(score: number) {
  if (score >= 85) return "text-green-700 bg-green-100 border-green-200";
  if (score >= 70) return "text-blue-700 bg-blue-100 border-blue-200";
  if (score >= 55) return "text-yellow-700 bg-yellow-100 border-yellow-200";
  return "text-red-700 bg-red-100 border-red-200";
}

function ExplanationBullets({ breakdown }: { breakdown: string | null }) {
  if (!breakdown) return null;
  let parsed: { explanation?: string[] } = {};
  try {
    parsed = JSON.parse(breakdown);
  } catch {
    return null;
  }
  const bullets = parsed.explanation ?? [];
  if (bullets.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1">
      {bullets.map((b, i) => (
        <li key={i} className="text-xs text-muted-foreground leading-snug">
          {b}
        </li>
      ))}
    </ul>
  );
}

function DiscoveredJobCard({
  job,
  onQueue,
  onSkip,
  queuing,
}: {
  job: Job;
  onQueue: (id: string) => void;
  onSkip: (id: string) => void;
  queuing: string | null;
}) {
  const score = job.fitScore ?? 0;
  const isLoading = queuing === job.id;

  return (
    <Card className="p-4 border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground leading-tight">
              {job.title}
            </h3>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor(score)}`}
            >
              {score}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {job.company}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {job.location}
              </span>
            )}
            {job.remote && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Remote
              </Badge>
            )}
            {job.salaryMin && job.salaryMax && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${Math.round(job.salaryMin / 1000)}k–${Math.round(job.salaryMax / 1000)}k
              </span>
            )}
          </div>
          <ExplanationBullets breakdown={job.fitBreakdown} />
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <Button
            size="sm"
            className="gap-1 text-xs"
            onClick={() => onQueue(job.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
            Queue
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-xs text-muted-foreground"
            onClick={() => onSkip(job.id)}
            disabled={isLoading}
          >
            <SkipForward className="w-3 h-3" />
            Skip
          </Button>
        </div>
      </div>
    </Card>
  );
}

function QueuedJobCard({
  job,
  appInfo,
  generating,
}: {
  job: Job;
  appInfo: AppInfo | undefined;
  generating: boolean;
}) {
  const score = job.fitScore ?? 0;

  return (
    <Card className="p-3 border">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          {appInfo?.hasPacket ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : generating ? (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Clock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{job.title}</span>
            <span
              className={`text-xs font-bold px-1.5 py-0 rounded-full border ${scoreColor(score)}`}
            >
              {score}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{job.company}</p>
          {appInfo?.hasPacket && (
            <p className="text-xs text-green-600 font-medium mt-0.5">Packet ready</p>
          )}
          {generating && !appInfo?.hasPacket && (
            <p className="text-xs text-blue-500 mt-0.5">Generating...</p>
          )}
        </div>
        <div className="shrink-0">
          {appInfo?.hasPacket ? (
            <Link href={`/jobs/${job.id}/packet/${appInfo.appId}`}>
              <Button size="sm" className="gap-1 text-xs">
                Let&apos;s Apply
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          ) : (
            <Link href={`/jobs/${job.id}`}>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                View Job
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export function HuntClient({
  initialQueuedJobs,
  appMap: initialAppMap,
  apiKeyConfigured,
}: HuntClientProps) {
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<DiscoverResult | null>(null);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [queuedJobs, setQueuedJobs] = useState<Job[]>(initialQueuedJobs);
  const [appMap, setAppMap] = useState<Record<string, AppInfo>>(initialAppMap);
  const [queuingId, setQueuingId] = useState<string | null>(null);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [generateProgress, setGenerateProgress] = useState<string | null>(null);

  const handleDiscover = useCallback(async () => {
    setDiscovering(true);
    setDiscoverError(null);
    setDiscoverResult(null);

    try {
      const res = await fetch("/api/jobs/discover", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setDiscoverError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setDiscoverResult(data);
      }
    } catch {
      setDiscoverError("Could not connect to the job search service. Check your internet connection.");
    } finally {
      setDiscovering(false);
    }
  }, []);

  const handleQueue = useCallback(async (jobId: string) => {
    setQueuingId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "queued" }),
      });
      if (res.ok) {
        const updatedJob: Job = await res.json();
        setQueuedJobs((prev) => {
          const exists = prev.find((j) => j.id === jobId);
          if (exists) return prev;
          return [...prev, updatedJob].sort((a, b) => (b.fitScore ?? 0) - (a.fitScore ?? 0));
        });
        // Remove from discovered list
        setDiscoverResult((prev) =>
          prev
            ? { ...prev, jobs: prev.jobs.filter((j) => j.id !== jobId) }
            : prev
        );
      }
    } finally {
      setQueuingId(null);
    }
  }, []);

  const handleSkip = useCallback(async (jobId: string) => {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    setDiscoverResult((prev) =>
      prev ? { ...prev, jobs: prev.jobs.filter((j) => j.id !== jobId) } : prev
    );
  }, []);

  const handleGenerateAll = useCallback(async () => {
    const jobsNeedingPackets = queuedJobs.filter(
      (j) => !appMap[j.id]?.hasPacket
    );
    if (jobsNeedingPackets.length === 0) return;

    let done = 0;

    for (const job of jobsNeedingPackets) {
      setGeneratingIds((prev) => new Set(prev).add(job.id));
      setGenerateProgress(`Generating ${done + 1} of ${jobsNeedingPackets.length}...`);

      try {
        // Create application if needed
        let appId = appMap[job.id]?.appId;
        if (!appId) {
          const appRes = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId: job.id }),
          });
          if (appRes.ok) {
            const app = await appRes.json();
            appId = app.id;
          }
        }

        if (!appId) continue;

        // Generate packet (template mode — no LLM needed)
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: appId, mode: "template" }),
        });

        if (genRes.ok) {
          setAppMap((prev) => ({
            ...prev,
            [job.id]: { appId: appId!, hasPacket: true },
          }));
        }
      } finally {
        setGeneratingIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        done++;
      }
    }

    setGenerateProgress(null);
  }, [queuedJobs, appMap]);

  const readyCount = queuedJobs.filter((j) => appMap[j.id]?.hasPacket).length;
  const pendingCount = queuedJobs.length - readyCount;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Today&apos;s Job Hunt</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find new jobs, build your materials, and apply — one step at a time.
        </p>
      </div>

      {/* Step 1: Find Jobs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            1
          </div>
          <h2 className="font-semibold text-base">Find New Jobs</h2>
        </div>

        {!apiKeyConfigured ? (
          <Card className="p-4 border-dashed border-2 border-muted">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Job search not set up yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  To find jobs automatically, add a <code className="bg-muted px-1 rounded">RAPIDAPI_KEY</code> to
                  your <code className="bg-muted px-1 rounded">.env.local</code> file.
                  Get a free key at{" "}
                  <span className="font-medium text-foreground">rapidapi.com</span>{" "}
                  and search for the JSearch API.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            onClick={handleDiscover}
            disabled={discovering}
            size="lg"
            className="w-full gap-2 text-base py-6"
          >
            {discovering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching for AR Specialist jobs in Central Florida...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Find Today&apos;s Jobs
              </>
            )}
          </Button>
        )}

        {discoverError && (
          <Card className="p-3 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{discoverError}</p>
          </Card>
        )}

        {discoverResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Found <span className="text-primary font-bold">{discoverResult.added}</span> new jobs
                {discoverResult.skipped > 0 && (
                  <span className="text-muted-foreground">
                    {" "}({discoverResult.skipped} already in your list)
                  </span>
                )}
              </p>
              {discoverResult.added === 0 && (
                <p className="text-xs text-muted-foreground">
                  No new jobs found — try again tomorrow.
                </p>
              )}
            </div>

            {discoverResult.jobs.map((job) => (
              <DiscoveredJobCard
                key={job.id}
                job={job}
                onQueue={handleQueue}
                onSkip={handleSkip}
                queuing={queuingId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Step 2: Queue */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              2
            </div>
            <h2 className="font-semibold text-base">
              Today&apos;s Queue
              {queuedJobs.length > 0 && (
                <span className="ml-2 text-sm text-muted-foreground font-normal">
                  ({queuedJobs.length} job{queuedJobs.length !== 1 ? "s" : ""})
                </span>
              )}
            </h2>
          </div>

          {pendingCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateAll}
              disabled={generatingIds.size > 0}
              className="gap-1.5"
            >
              {generatingIds.size > 0 ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {generateProgress}
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Build All Packets ({pendingCount})
                </>
              )}
            </Button>
          )}
        </div>

        {queuedJobs.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-2">
            <p className="text-sm text-muted-foreground">
              Your queue is empty. Find jobs above and click <strong>Queue</strong> to add them here.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Or <Link href="/jobs/new" className="text-primary underline">add a job manually</Link> from a job board.
            </p>
          </Card>
        ) : (
          <>
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{readyCount} of {queuedJobs.length} ready to apply</span>
                {readyCount === queuedJobs.length && (
                  <span className="text-green-600 font-medium">All done! ✅</span>
                )}
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: queuedJobs.length > 0 ? `${(readyCount / queuedJobs.length) * 100}%` : "0%" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {queuedJobs.map((job) => (
                <QueuedJobCard
                  key={job.id}
                  job={job}
                  appInfo={appMap[job.id]}
                  generating={generatingIds.has(job.id)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Step 3: Apply */}
      {readyCount > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              3
            </div>
            <h2 className="font-semibold text-base">Apply — One at a Time</h2>
          </div>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm text-green-800">
              <strong>{readyCount} packet{readyCount !== 1 ? "s" : ""} ready!</strong> Click &quot;Let&apos;s Apply&quot; next to any job above to open your materials and start the application.
            </p>
          </Card>
        </section>
      )}
    </div>
  );
}
