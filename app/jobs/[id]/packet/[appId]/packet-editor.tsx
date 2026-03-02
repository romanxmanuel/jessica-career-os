"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Wand2,
  Bot,
  CheckCircle2,
  FileText,
  MessageSquare,
  Send,
  HelpCircle,
  Clipboard,
  ExternalLink,
  ClipboardCheck,
} from "lucide-react";
import type { Application, Job, ResumeProfile } from "@/db/schema";

// ATS detection for Fill Assist field tips
const ATS_TIPS: Record<string, { name: string; tips: string[] }> = {
  "workday.com": {
    name: "Workday",
    tips: [
      "Paste your cover letter into the \"Cover Letter\" text box.",
      "Copy resume bullets into the \"Work Experience\" section under each job.",
      "Use the \"Additional Information\" box for extra context.",
    ],
  },
  "myworkdayjobs.com": {
    name: "Workday",
    tips: [
      "Paste your cover letter into the \"Cover Letter\" text box.",
      "Copy resume bullets into the \"Work Experience\" section under each job.",
    ],
  },
  "greenhouse.io": {
    name: "Greenhouse",
    tips: [
      "Paste your cover letter into the \"Cover Letter\" field.",
      "Paste resume bullets into the resume upload or \"Additional Information\" section.",
    ],
  },
  "lever.co": {
    name: "Lever",
    tips: [
      "Paste your cover letter into the text box below the resume upload.",
      "Copy bullets into the \"Additional Information\" field.",
    ],
  },
  "icims.com": {
    name: "iCIMS",
    tips: [
      "Upload your resume as a file, or paste bullets into the \"Work History\" section.",
      "Paste cover letter into the \"Cover Letter\" box on the application form.",
    ],
  },
  "indeed.com": {
    name: "Indeed",
    tips: [
      "Paste your cover letter into the cover letter text box.",
      "If applying directly, copy resume bullets into the resume section.",
    ],
  },
  "linkedin.com": {
    name: "LinkedIn Easy Apply",
    tips: [
      "For Easy Apply: paste resume bullets into the \"Additional Information\" box.",
      "Paste your outreach message to connect with the hiring manager after applying.",
    ],
  },
  "taleo.net": {
    name: "Taleo (Oracle)",
    tips: [
      "Paste resume bullets into the Work History section for each past job.",
      "Cover letter goes in the \"Attachments\" step — save as a .docx file.",
    ],
  },
};

function detectATS(url: string | null): { name: string; tips: string[] } | null {
  if (!url) return null;
  for (const [domain, info] of Object.entries(ATS_TIPS)) {
    if (url.includes(domain)) return info;
  }
  return null;
}

function FillAssist({
  jobUrl,
  coverLetter,
  tailoredResume,
  outreachMessage,
  onSubmit,
  submitting,
}: {
  jobUrl: string | null;
  coverLetter: string;
  tailoredResume: string;
  outreachMessage: string;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const ats = detectATS(jobUrl);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    }
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-primary">
          <Send className="w-4 h-4" />
          Fill Assist — Step by Step
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Open the job application, then copy your materials one at a time.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Open Application */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Step 1 — Open the Application
          </p>
          {jobUrl ? (
            <a href={jobUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-2 w-full justify-start">
                <ExternalLink className="w-4 h-4" />
                Open Application ↗
                <span className="text-xs text-muted-foreground ml-auto truncate max-w-[140px]">
                  {jobUrl}
                </span>
              </Button>
            </a>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No URL saved for this job. Go to the job site and find the application link.
            </p>
          )}
        </div>

        {/* ATS Tips */}
        {ats && (
          <div className="p-3 rounded-md bg-blue-50 border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-1">
              💡 This looks like a <strong>{ats.name}</strong> application
            </p>
            <ul className="space-y-1">
              {ats.tips.map((tip, i) => (
                <li key={i} className="text-xs text-blue-700">
                  • {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 2: Copy Materials */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Step 2 — Copy Your Materials
          </p>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => copyText("coverLetter", coverLetter)}
            disabled={!coverLetter}
          >
            {copied === "coverLetter" ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Cover Letter Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4" />
                Copy Cover Letter
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => copyText("resumeBullets", tailoredResume)}
            disabled={!tailoredResume}
          >
            {copied === "resumeBullets" ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Resume Bullets Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4" />
                Copy Resume Bullets
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => copyText("outreach", outreachMessage)}
            disabled={!outreachMessage}
          >
            {copied === "outreach" ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Outreach Message Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4" />
                Copy Outreach Message
              </>
            )}
          </Button>
        </div>

        {/* Step 3: Submit */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Step 3 — After You Submit
          </p>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full gap-2 bg-green-700 hover:bg-green-800 text-white"
            size="sm"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            I&apos;ve Submitted This Application
          </Button>
          <p className="text-xs text-muted-foreground">
            Click this only after you&apos;ve submitted on the company&apos;s website.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type Props = {
  application: Application;
  job: Job;
  resume: ResumeProfile | null;
  hasAiKey: boolean;
};

type ScreeningQA = { question: string; answer: string };

export function PacketEditor({ application, job, resume, hasAiKey }: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"template" | "ai">("template");

  const [coverLetter, setCoverLetter] = useState(application.coverLetter ?? "");
  const [tailoredResume, setTailoredResume] = useState(application.tailoredResume ?? "");
  const [outreachMessage, setOutreachMessage] = useState(application.outreachMessage ?? "");
  const [screeningQa, setScreeningQa] = useState<ScreeningQA[]>(() => {
    try {
      return JSON.parse(application.screeningQa ?? "[]");
    } catch {
      return [];
    }
  });

  const isSubmitted = application.status === "submitted";

  // ── Autosave (debounced, 2 seconds after last change) ──────────────────────
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const doAutoSave = useCallback(
    async (cl: string, tr: string, om: string, qa: ScreeningQA[]) => {
      setAutoSaveStatus("saving");
      try {
        await fetch(`/api/applications/${application.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coverLetter: cl,
            tailoredResume: tr,
            outreachMessage: om,
            screeningQa: JSON.stringify(qa),
          }),
        });
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      } catch {
        setAutoSaveStatus("idle");
      }
    },
    [application.id]
  );

  useEffect(() => {
    // Skip autosave on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      doAutoSave(coverLetter, tailoredResume, outreachMessage, screeningQa);
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverLetter, tailoredResume, outreachMessage, screeningQa]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          mode,
        }),
      });
      const data = await res.json();
      if (data.packet) {
        setCoverLetter(data.packet.coverLetter ?? "");
        setTailoredResume(data.packet.tailoredResume ?? "");
        setOutreachMessage(data.packet.outreachMessage ?? "");
        try {
          setScreeningQa(JSON.parse(data.packet.screeningQa ?? "[]"));
        } catch {
          setScreeningQa([]);
        }
      }
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coverLetter,
          tailoredResume,
          outreachMessage,
          screeningQa: JSON.stringify(screeningQa),
        }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function humanApproveAndSubmit() {
    if (!confirm("Mark this application as submitted? This confirms you have manually submitted it on the company's site.")) {
      return;
    }
    setSubmitting(true);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ humanApprove: true }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-800">Application Submitted</p>
          <p className="text-xs text-green-700">
            Submitted on {new Date(application.submittedAt ?? Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  const hasContent = coverLetter || tailoredResume || outreachMessage;

  return (
    <div className="space-y-4">
      {/* Generate Controls */}
      {!hasContent && (
        <Card>
          <CardContent className="pt-5">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate your apply packet using your resume + this job description.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => { setMode("template"); generate(); }}
                  disabled={generating}
                  variant="outline"
                  className="gap-2"
                >
                  {generating && mode === "template" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  Template (Fast)
                </Button>
                {hasAiKey && (
                  <Button
                    onClick={() => { setMode("ai"); generate(); }}
                    disabled={generating}
                    className="gap-2"
                  >
                    {generating && mode === "ai" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                    Generate with AI
                  </Button>
                )}
              </div>
              {!hasAiKey && (
                <p className="text-xs text-muted-foreground">
                  Add ANTHROPIC_API_KEY to .env.local to enable AI generation.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {hasContent && (
        <>
          {/* Regenerate bar */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Packet generated. Edit any section below.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setMode("template"); generate(); }} disabled={generating}>
                <Wand2 className="w-3.5 h-3.5 mr-1" /> Regenerate
              </Button>
              {hasAiKey && (
                <Button variant="ghost" size="sm" onClick={() => { setMode("ai"); generate(); }} disabled={generating}>
                  <Bot className="w-3.5 h-3.5 mr-1" /> AI
                </Button>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Cover Letter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="h-56 font-mono text-xs leading-relaxed"
              />
            </CardContent>
          </Card>

          {/* Tailored Resume Bullets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tailored Resume Bullets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={tailoredResume}
                onChange={(e) => setTailoredResume(e.target.value)}
                className="h-48 font-mono text-xs leading-relaxed"
              />
            </CardContent>
          </Card>

          {/* Outreach Message */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Outreach Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={outreachMessage}
                onChange={(e) => setOutreachMessage(e.target.value)}
                className="h-32 text-sm"
              />
            </CardContent>
          </Card>

          {/* Screening Q&A */}
          {screeningQa.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Screening Q&A
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {screeningQa.map((qa, i) => (
                  <div key={i} className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Q{i + 1}: {qa.question}
                    </p>
                    <Textarea
                      value={qa.answer}
                      onChange={(e) => {
                        const updated = [...screeningQa];
                        updated[i] = { ...qa, answer: e.target.value };
                        setScreeningQa(updated);
                      }}
                      className="h-24 text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Save Draft */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={save} variant="outline" disabled={saving || isSubmitted}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Save Draft
            </Button>
            <p className="text-xs text-muted-foreground">
              {autoSaveStatus === "saving" && (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
              {autoSaveStatus === "idle" && "Edits are auto-saved after 2 seconds."}
            </p>
          </div>

          {/* Fill Assist — Step-by-Step Apply Guide */}
          <FillAssist
            jobUrl={job.url ?? null}
            coverLetter={coverLetter}
            tailoredResume={tailoredResume}
            outreachMessage={outreachMessage}
            onSubmit={humanApproveAndSubmit}
            submitting={submitting}
          />
        </>
      )}
    </div>
  );
}
