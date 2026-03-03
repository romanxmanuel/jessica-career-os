import { db } from "@/lib/db";
import { applications, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { KanbanActions } from "./kanban-actions";

export const dynamic = "force-dynamic";

const COLUMNS = [
  { key: "draft", label: "Draft", color: "bg-gray-100" },
  { key: "human_review", label: "Needs Review", color: "bg-yellow-50" },
  { key: "submitted", label: "Submitted", color: "bg-blue-50" },
  { key: "interviewing", label: "Interviewing", color: "bg-purple-50" },
  { key: "offer", label: "Offer", color: "bg-green-50" },
  { key: "rejected", label: "Rejected", color: "bg-red-50" },
  { key: "ghosted", label: "Ghosted", color: "bg-gray-50" },
] as const;

const BADGE_MAP: Record<string, "default" | "success" | "warning" | "info" | "danger" | "secondary" | "outline"> = {
  draft: "secondary",
  human_review: "warning",
  submitted: "info",
  interviewing: "default",
  offer: "success",
  rejected: "danger",
  ghosted: "outline",
};

export default async function TrackerPage() {
  const allApps = await db
    .select({
      id: applications.id,
      status: applications.status,
      submittedAt: applications.submittedAt,
      humanApprovedAt: applications.humanApprovedAt,
      createdAt: applications.createdAt,
      updatedAt: applications.updatedAt,
      jobId: applications.jobId,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
      jobFitScore: jobs.fitScore,
      jobRemote: jobs.remote,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .all();

  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.key] = allApps.filter((a) => a.status === col.key);
      return acc;
    },
    {} as Record<string, typeof allApps>
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Application Tracker</h1>
        <p className="text-sm text-muted-foreground">
          {allApps.length} total applications
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const cards = grouped[col.key] ?? [];
          return (
            <div key={col.key} className="shrink-0 w-64">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-sm font-medium">{col.label}</span>
                <Badge variant="secondary">{cards.length}</Badge>
              </div>
              <div className={`rounded-lg p-2 space-y-2 min-h-[120px] ${col.color}`}>
                {cards.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
                ) : (
                  cards.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white rounded-md border border-border p-3 shadow-sm space-y-1.5"
                    >
                      <Link href={`/jobs/${app.jobId}/packet/${app.id}`}>
                        <p className="text-sm font-medium hover:underline leading-tight">
                          {app.jobTitle}
                        </p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {app.jobCompany}
                      </p>
                      <div className="flex items-center justify-between">
                        {app.jobFitScore != null && (
                          <span
                            className={`text-xs font-semibold ${
                              app.jobFitScore >= 80
                                ? "text-green-700"
                                : app.jobFitScore >= 65
                                ? "text-blue-700"
                                : "text-yellow-700"
                            }`}
                          >
                            Fit: {app.jobFitScore}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(app.updatedAt)}
                        </span>
                      </div>
                      <KanbanActions appId={app.id} currentStatus={app.status ?? "draft"} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
