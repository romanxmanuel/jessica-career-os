import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumeProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const CreateResumeSchema = z.object({
  label: z.string().min(1),
  content: z.string().min(10),
  headline: z.string().optional(),
  skills: z.array(z.string()).optional(),
  yearsExperience: z.number().int().optional(),
  targetRoleLevel: z
    .enum(["junior", "mid", "senior", "staff", "director"])
    .optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const all = db.select().from(resumeProfiles).all();
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateResumeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const now = new Date();
  const id = createId();

  // If setting as default, unset others
  if (parsed.data.isDefault) {
    db.update(resumeProfiles).set({ isDefault: false }).run();
  }

  db.insert(resumeProfiles)
    .values({
      id,
      label: parsed.data.label,
      content: parsed.data.content,
      headline: parsed.data.headline ?? null,
      skills: parsed.data.skills ? JSON.stringify(parsed.data.skills) : null,
      yearsExperience: parsed.data.yearsExperience ?? null,
      targetRoleLevel: parsed.data.targetRoleLevel ?? "senior",
      isDefault: parsed.data.isDefault ?? false,
      createdAt: now,
    })
    .run();

  const newResume = db
    .select()
    .from(resumeProfiles)
    .where(eq(resumeProfiles.id, id))
    .get();

  return NextResponse.json(newResume, { status: 201 });
}
