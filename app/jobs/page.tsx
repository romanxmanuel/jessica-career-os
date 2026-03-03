import { db } from "@/lib/db";
import { jobs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { fitScoreBg, fitScoreColor } from "@/lib/scoring/fit-score";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, "default" | "success" | "warning" | "info" | "danger" | "secondary" | "outline"> = {
  new: "secondary",
  queued: "info",
  applying: "warning",
  applied: "success",
  archived: "outline",
};

export default async function JobsPage() {
  const allJobs = await db.select().from(jobs).orderBy(desc(jobs.fitScore)).all();

  const grouped = {
    queued: allJobs.filter((j) => j.status === "queued"),
    new: allJobs.filter((j) => j.status === "new"),
    applying: allJobs.filter((j) => j.status === "applying"),
    applied: allJobs.filter((j) => j.status === "applied"),
    archived: allJobs.filter((j) => j.status === "archived"),
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Jobs</h1>
          <p className="text-sm text-muted-foreground">
            {allJobs.length} total · {grouped.queued.length} queued · {grouped.applying.length} in progress
          </p>
        </div>
        <Link href="/jobs/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Job
          </Button>
        </Link>
      </div>

      {allJobs.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">No jobs yet.</p>
          <Link href="/jobs/new" className="mt-3 inline-block">
            <Button size="sm">Add your first job</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-1">
          {allJobs.map((job) => {
            const score = job.fitScore;
            const statusVariant = STATUS_STYLE[job.status ?? "new"] ?? "secondary";

            return (
              <div key={job.id} className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors">
                {/* Fit Score */}
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                    score != null ? fitScoreBg(score) : "bg-muted"
                  } ${score != null ? fitScoreColor(score) : "text-muted-foreground"}`}
                >
                  {score ?? "—"}
                </div>

                {/* Job Info — clickable area */}
                <Link href={`/jobs/${job.id}`} className="flex-1 min-w-0 block">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{job.title}</span>
                    {job.priority === 1 && (
                      <Badge variant="warning" className="text-xs">High</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                    {job.remote ? " · Remote" : ""}
                  </p>
                </Link>

                {/* Salary */}
                {job.salaryMin && (
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    ${Math.round(job.salaryMin / 1000)}k–${Math.round((job.salaryMax ?? job.salaryMin) / 1000)}k
                  </span>
                )}

                {/* Status */}
                <Badge variant={statusVariant}>{job.status}</Badge>

                {/* External Link — separate from the Link above */}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
