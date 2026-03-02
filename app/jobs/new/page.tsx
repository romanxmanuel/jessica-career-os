"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    url: "",
    rawJd: "",
    notes: "",
    remote: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.company || !form.rawJd) {
      setError("Title, company, and job description are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] ?? "Failed to save job.");
      }

      const job = await res.json();
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Add Job</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="Senior Product Manager"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="Stripe"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="url">Job URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remote"
                checked={form.remote}
                onChange={(e) => setForm({ ...form, remote: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="remote" className="cursor-pointer">Remote / Hybrid</Label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rawJd">
                Job Description *{" "}
                <span className="text-muted-foreground font-normal">
                  (paste the full JD)
                </span>
              </Label>
              <Textarea
                id="rawJd"
                placeholder="Paste the full job description here..."
                value={form.rawJd}
                onChange={(e) => setForm({ ...form, rawJd: e.target.value })}
                className="h-48"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Any context, referrals, flags..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Scoring..." : "Add Job & Score Fit"}
              </Button>
              <Link href="/jobs">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
