import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

const CreateContactSchema = z.object({
  jobId: z.string().min(1),
  name: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  const all = jobId
    ? db.select().from(contacts).where(eq(contacts.jobId, jobId)).all()
    : db.select().from(contacts).all();

  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const now = new Date();
  const id = createId();

  db.insert(contacts)
    .values({
      id,
      jobId: parsed.data.jobId,
      name: parsed.data.name ?? null,
      title: parsed.data.title ?? null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      email: parsed.data.email || null,
      notes: parsed.data.notes ?? null,
      createdAt: now,
    })
    .run();

  const created = db.select().from(contacts).where(eq(contacts.id, id)).get();
  return NextResponse.json(created, { status: 201 });
}
