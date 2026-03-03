import { db } from "@/lib/db";
import { applications, jobs, resumeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Bot, Shield } from "lucide-react";
import Link from "next/link";
import { PacketEditor } from "./packet-editor";

export const dynamic = "force-dynamic";

export default async function PacketPage({
  params,
}: {
  params: Promise<{ id: string; appId: string }>;
}) {
  const { id, appId } = await params;
  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, appId))
    .get();

  if (!app) notFound();

  const job = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) notFound();

  const resume = app.resumeId
    ? await db.select().from(resumeProfiles).where(eq(resumeProfiles.id, app.resumeId)).get()
    : await db
        .select()
        .from(resumeProfiles)
        .where(eq(resumeProfiles.isDefault, true))
        .get();

  const hasAiKey = !!process.env.ANTHROPIC_API_KEY;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/jobs/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Apply Packet</h1>
          <p className="text-sm text-muted-foreground">
            {job.title} @ {job.company}
          </p>
        </div>
        <div className="ml-auto">
          <Badge
            variant={
              app.status === "submitted"
                ? "success"
                : app.status === "human_review"
                ? "warning"
                : "secondary"
            }
          >
            {app.status}
          </Badge>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <Shield className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <strong>Human review required.</strong> Review and edit every section before submitting. No content is submitted automatically.
        </div>
      </div>

      <PacketEditor
        application={app}
        job={job}
        resume={resume ?? null}
        hasAiKey={hasAiKey}
      />
    </div>
  );
}
