"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Trash2,
  ExternalLink,
  Mail,
  Linkedin,
  Package,
} from "lucide-react";
import type { OutreachPack } from "@/lib/generators/outreach-pack";

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button variant="ghost" size="sm" onClick={copy} className="gap-1.5 h-7 text-xs">
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

// ── Message block ─────────────────────────────────────────────────────────────
function MessageBlock({
  subject,
  body,
  label,
}: {
  subject: string;
  body: string;
  label: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <CopyBtn text={`Subject: ${subject}\n\n${body}`} label="Copy All" />
      </div>
      <div className="bg-muted/50 rounded-md p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Subject:</span>
          <span className="text-xs font-medium">{subject}</span>
          <CopyBtn text={subject} label="Copy" />
        </div>
        <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">{body}</pre>
      </div>
    </div>
  );
}

// ── Contact form ──────────────────────────────────────────────────────────────
interface ContactData {
  id: string;
  name: string | null;
  title: string | null;
  linkedinUrl: string | null;
  email: string | null;
  notes: string | null;
}

function ContactForm({
  jobId,
  existingContacts,
}: {
  jobId: string;
  existingContacts: ContactData[];
}) {
  const [contacts, setContacts] = useState<ContactData[]>(existingContacts);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    linkedinUrl: "",
    email: "",
    notes: "",
  });

  async function handleAdd() {
    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, ...form }),
      });
      if (res.ok) {
        const created = await res.json();
        setContacts((prev) => [...prev, created]);
        setForm({ name: "", title: "", linkedinUrl: "", email: "", notes: "" });
        setAdding(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Contacts at this company
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdding(!adding)}
          className="gap-1 h-7 text-xs"
        >
          <UserPlus className="w-3 h-3" />
          Add Contact
        </Button>
      </div>

      {contacts.length > 0 && (
        <div className="space-y-2">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-medium">{c.name || "Unknown"}</span>
                {c.title && <span className="text-muted-foreground"> · {c.title}</span>}
                <div className="flex gap-2 mt-1">
                  {c.email && (
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Mail className="w-3 h-3" />
                      {c.email}
                    </a>
                  )}
                  {c.linkedinUrl && (
                    <a
                      href={c.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Linkedin className="w-3 h-3" />
                      LinkedIn
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(c.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="border rounded-md p-3 space-y-2 bg-background">
          <div className="grid grid-cols-2 gap-2">
            <input
              className="text-xs border rounded px-2 py-1.5 bg-background"
              placeholder="Name (e.g. Sarah Jones)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="text-xs border rounded px-2 py-1.5 bg-background"
              placeholder="Title (e.g. Recruiter)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="text-xs border rounded px-2 py-1.5 bg-background"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="text-xs border rounded px-2 py-1.5 bg-background"
              placeholder="LinkedIn URL"
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
            />
          </div>
          <input
            className="text-xs border rounded px-2 py-1.5 bg-background w-full"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={saving} className="h-7 text-xs">
              {saving ? "Saving..." : "Save Contact"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAdding(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {contacts.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground italic">
          No contacts saved. Add a recruiter or hiring manager to reach out to.
        </p>
      )}
    </div>
  );
}

// ── Main outreach panel ───────────────────────────────────────────────────────
interface OutreachPanelProps {
  appId: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  status: string;
  outreachMessage: string;
  pack: OutreachPack;
  contacts: ContactData[];
}

export function OutreachPanel({
  jobId,
  jobTitle,
  jobCompany,
  status,
  outreachMessage,
  pack,
  contacts,
}: OutreachPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPack, setShowPack] = useState(false);

  const statusVariant =
    status === "submitted"
      ? "success"
      : status === "interviewing"
      ? "default"
      : "secondary";

  const allMessages = [
    `Subject: ${pack.recruiterSubject}\n\n${pack.recruiterMessage}`,
    `Subject: ${pack.hiringManagerSubject}\n\n${pack.hiringManagerMessage}`,
    `Subject: ${pack.followUpSubject}\n\n${pack.followUpMessage}`,
  ].join("\n\n---\n\n");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">{jobTitle}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{jobCompany}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant as "success" | "default" | "secondary"}>
              {status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-7 w-7 p-0"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5 pt-0">
          {/* Original outreach from packet */}
          {outreachMessage && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  LinkedIn / Email Message (from your packet)
                </span>
                <CopyBtn text={outreachMessage} label="Copy" />
              </div>
              <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed bg-muted/50 rounded-md p-3">
                {outreachMessage}
              </pre>
            </div>
          )}

          {/* Outreach Pack */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors"
                onClick={() => setShowPack(!showPack)}
              >
                <Package className="w-3.5 h-3.5" />
                Full Outreach Pack (3 messages)
                {showPack ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <CopyBtn text={allMessages} label="Export All 3" />
            </div>

            {showPack && (
              <div className="space-y-4 pl-2 border-l-2 border-primary/20">
                <MessageBlock
                  label="Recruiter Message"
                  subject={pack.recruiterSubject}
                  body={pack.recruiterMessage}
                />
                <MessageBlock
                  label="Hiring Manager Message"
                  subject={pack.hiringManagerSubject}
                  body={pack.hiringManagerMessage}
                />
                <MessageBlock
                  label="Follow-Up (5 days later)"
                  subject={pack.followUpSubject}
                  body={pack.followUpMessage}
                />
              </div>
            )}
          </div>

          {/* Contacts */}
          <div className="border-t border-border pt-4">
            <ContactForm jobId={jobId} existingContacts={contacts} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
