import { db } from "@/lib/db";
import { jobs, applications, resumeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ExternalLink,
  Zap,
  MapPin,
  Building2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { fitScoreColor, fitScoreLabel, fitScoreBg } from "@/lib/scoring/fit-score";
import { JobActions } from "./job-actions";

export const dynamic = "force-dynamic";

type FitBreakdown = {
  skillMatch: number;
  titleSimilarity: number;
  seniorityAlignment: number;
  locationRemote: number;
  compensation: number;
  companySize: number;
  total: number;
};

const BREAKDOWN_LABELS: Record<keyof Omit<FitBreakdown, "total">, string> = {
  skillMatch: "Skill Match",
  titleSimilarity: "Title Alignment",
  seniorityAlignment: "Seniority",
  locationRemote: "Location / Remote",
  compensation: "Compensation",
  companySize: "Company Stage",
};

const BREAKDOWN_MAX: Record<keyof Omit<FitBreakdown, "total">, number> = {
  skillMatch: 40,
  titleSimilarity: 20,
  seniorityAlignment: 15,
  locationRemote: 10,
  compensation: 10,
  companySize: 5,
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) notFound();

  const existingApp = await db
    .select()
    .from(applications)
    .where(eq(applications.jobId, id))
    .get();

  const parsedSkills: string[] = JSON.parse(job.parsedSkills ?? "[]");
  const breakdown: FitBreakdown | null = job.fitBreakdown
    ? JSON.parse(job.fitBreakdown)
    : null;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold">{job.title}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.company}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                    {job.remote ? " (Remote)" : ""}
                  </span>
                )}
                {job.salaryMin && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    ${Math.round(job.salaryMin / 1000)}k–${Math.round((job.salaryMax ?? job.salaryMin) / 1000)}k
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {job.url && (
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open JD
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fit Score */}
      {job.fitScore != null && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shrink-0 ${fitScoreBg(job.fitScore)} ${fitScoreColor(job.fitScore)}`}
              >
                {job.fitScore}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {fitScoreLabel(job.fitScore)} Fit
                  </span>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Score based on skill match, seniority, location, and compensation.
                </p>
              </div>
            </div>

            {breakdown && (
              <div className="mt-4 space-y-2">
                {(Object.keys(BREAKDOWN_LABELS) as Array<keyof typeof BREAKDOWN_LABELS>).map((key) => {
                  const val = breakdown[key];
                  const max = BREAKDOWN_MAX[key];
                  const pct = Math.round((val / max) * 100);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-36 shrink-0">
                        {BREAKDOWN_LABELS[key]}
                      </span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-blue-500" : "bg-yellow-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-12 text-right">
                        {val}/{max}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Matched Skills */}
      {parsedSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Skills in JD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {parsedSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <JobActions job={job} existingAppId={existingApp?.id ?? null} />

      {/* Notes */}
      {job.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{job.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
            {job.rawJd}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
