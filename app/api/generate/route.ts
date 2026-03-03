import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, jobs, resumeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generatePacketTemplate } from "@/lib/generators/template";
import { isAIAvailable } from "@/lib/ai-client";
import { generatePacketAI } from "@/lib/generators/ai";

// Allow AI generation calls up to 60 seconds (Pro plan) or 15s (Hobby)
export const maxDuration = 60;

const GenerateSchema = z.object({
  applicationId: z.string().min(1),
  mode: z.enum(["template", "ai"]).default("template"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const app = await db
    .select()
    .from(applications)
    .where(eq(applications.id, parsed.data.applicationId))
    .get();

  if (!app) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const job = await db.select().from(jobs).where(eq(jobs.id, app.jobId)).get();
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const resume = app.resumeId
    ? await db
        .select()
        .from(resumeProfiles)
        .where(eq(resumeProfiles.id, app.resumeId))
        .get()
    : await db
        .select()
        .from(resumeProfiles)
        .where(eq(resumeProfiles.isDefault, true))
        .get();

  if (!resume) {
    return NextResponse.json(
      { error: "No resume profile found. Please add one first." },
      { status: 400 }
    );
  }

  let packet: {
    coverLetter: string;
    tailoredResume: string;
    outreachMessage: string;
    screeningQa: string;
  };

  try {
    if (parsed.data.mode === "ai" && isAIAvailable()) {
      packet = await generatePacketAI({ job, resume });
    } else {
      packet = generatePacketTemplate({ job, resume });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Save generated content back to application
  const now = new Date();
  await db.update(applications)
    .set({
      coverLetter: packet.coverLetter,
      tailoredResume: packet.tailoredResume,
      outreachMessage: packet.outreachMessage,
      screeningQa: packet.screeningQa,
      status: "human_review",
      updatedAt: now,
    })
    .where(eq(applications.id, parsed.data.applicationId))
    .run();

  return NextResponse.json({ success: true, packet });
}
