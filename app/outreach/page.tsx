import { db } from "@/lib/db";
import { applications, jobs, contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Package } from "lucide-react";
import Link from "next/link";
import { OutreachPanel } from "./outreach-panel";
import { generateOutreachPack } from "@/lib/generators/outreach-pack";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  // Load all applications that have an outreach message OR are submitted/interviewing
  const appsRaw = db
    .select({
      appId: applications.id,
      jobId: applications.jobId,
      outreachMessage: applications.outreachMessage,
      status: applications.status,
      jobTitle: jobs.title,
      jobCompany: jobs.company,
      jobLocation: jobs.location,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .all()
    .filter(
      (a) =>
        a.outreachMessage ||
        ["submitted", "interviewing", "offer", "rejected", "ghosted", "human_review"].includes(
          a.status ?? ""
        )
    )
    .sort((a, b) => {
      // Sort: active statuses first
      const priority: Record<string, number> = {
        interviewing: 0,
        human_review: 1,
        submitted: 2,
        ghosted: 3,
        rejected: 4,
        offer: 0,
      };
      return (priority[a.status ?? ""] ?? 5) - (priority[b.status ?? ""] ?? 5);
    });

  // Load default resume for outreach pack generation
  const { resumeProfiles } = await import("@/db/schema");
  const defaultResume = db
    .select()
    .from(resumeProfiles)
    .where(eq(resumeProfiles.isDefault, true))
    .get();

  // Load all contacts for the relevant job IDs
  const jobIds = appsRaw.map((a) => a.jobId).filter(Boolean) as string[];
  const allContacts = jobIds.length > 0
    ? db.select().from(contacts).all().filter((c) => c.jobId && jobIds.includes(c.jobId))
    : [];

  const contactsByJobId: Record<string, typeof allContacts> = {};
  for (const c of allContacts) {
    if (!c.jobId) continue;
    if (!contactsByJobId[c.jobId]) contactsByJobId[c.jobId] = [];
    contactsByJobId[c.jobId].push(c);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Send Messages
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Outreach messages for every company you&apos;ve applied to. Expand any card to copy, add contacts, and send follow-ups.
        </p>
      </div>

      {appsRaw.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <Package className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No outreach messages yet. Generate an apply packet for a job to create one automatically.
            </p>
            <Link href="/jobs">
              <Badge variant="info">Go to Job List</Badge>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Click any card to expand it and see your messages, outreach pack, and contact info.
          </p>
          {appsRaw.map((item) => {
            const pack = generateOutreachPack({
              jobTitle: item.jobTitle ?? "this role",
              company: item.jobCompany ?? "the company",
              location: item.jobLocation,
              resumeHeadline: defaultResume?.headline ?? "Accounts Receivable Specialist",
              resumeYearsExp: defaultResume?.yearsExperience ?? 10,
            });

            return (
              <OutreachPanel
                key={item.appId}
                appId={item.appId}
                jobId={item.jobId ?? ""}
                jobTitle={item.jobTitle ?? "Unknown Role"}
                jobCompany={item.jobCompany ?? "Unknown Company"}
                status={item.status ?? "draft"}
                outreachMessage={item.outreachMessage ?? ""}
                pack={pack}
                contacts={contactsByJobId[item.jobId ?? ""] ?? []}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
