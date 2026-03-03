import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateContactSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().optional(),
  email: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  await db.update(contacts).set(parsed.data).where(eq(contacts.id, id)).run();
  const updated = await db.select().from(contacts).where(eq(contacts.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(contacts).where(eq(contacts.id, id)).run();
  return NextResponse.json({ success: true });
}
