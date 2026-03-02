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

const LEVEL_OPTIONS = ["junior", "mid", "senior", "staff", "director"];

export default function NewResumePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    label: "",
    headline: "",
    content: "",
    skills: "",
    yearsExperience: "",
    targetRoleLevel: "senior",
    isDefault: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.label || !form.content) {
      setError("Label and resume content are required.");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label,
          headline: form.headline || undefined,
          content: form.content,
          skills: skillsArray,
          yearsExperience: form.yearsExperience
            ? parseInt(form.yearsExperience)
            : undefined,
          targetRoleLevel: form.targetRoleLevel,
          isDefault: form.isDefault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.[0] ?? "Failed to save.");
      }

      router.push("/resume");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/resume">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Add Resume Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="label">Profile Name *</Label>
                <Input
                  id="label"
                  placeholder="Senior PM v1"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  placeholder="Senior PM | B2B SaaS | 0→1 Products"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="yoe">Years of Experience</Label>
                <Input
                  id="yoe"
                  type="number"
                  placeholder="7"
                  value={form.yearsExperience}
                  onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="level">Target Role Level</Label>
                <select
                  id="level"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
                  value={form.targetRoleLevel}
                  onChange={(e) => setForm({ ...form, targetRoleLevel: e.target.value })}
                >
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l} value={l} className="capitalize">
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skills">
                Skills{" "}
                <span className="text-muted-foreground font-normal">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="skills"
                placeholder="Product Strategy, SQL, Mixpanel, B2B SaaS, A/B Testing"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="content">
                Resume Text *{" "}
                <span className="text-muted-foreground font-normal">
                  (paste your full resume)
                </span>
              </Label>
              <Textarea
                id="content"
                placeholder="Paste your full resume text here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="h-64"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default (used for fit scoring)
              </Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Saving..." : "Save Profile"}
              </Button>
              <Link href="/resume">
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
