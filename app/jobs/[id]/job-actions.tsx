"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Loader2, Archive, Star, StarOff } from "lucide-react";
import type { Job } from "@/db/schema";

type Props = {
  job: Job;
  existingAppId: string | null;
};

export function JobActions({ job, existingAppId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function createApplication() {
    setLoading("apply");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const app = await res.json();
      router.push(`/jobs/${job.id}/packet/${app.id}`);
    } finally {
      setLoading(null);
    }
  }

  async function updateStatus(status: string) {
    setLoading(status);
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function togglePriority() {
    const newPriority = job.priority === 1 ? 0 : 1;
    setLoading("priority");
    try {
      await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Primary: Start Application */}
          {!existingAppId ? (
            <Button
              onClick={createApplication}
              disabled={loading === "apply"}
              className="gap-2"
            >
              {loading === "apply" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Start Application
            </Button>
          ) : (
            <Button
              onClick={() =>
                router.push(`/jobs/${job.id}/packet/${existingAppId}`)
              }
              variant="outline"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              View Apply Packet
            </Button>
          )}

          {/* Queue toggle */}
          {job.status === "new" && (
            <Button
              variant="outline"
              onClick={() => updateStatus("queued")}
              disabled={loading === "queued"}
              className="gap-2"
            >
              {loading === "queued" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Add to Queue
            </Button>
          )}

          {/* Priority */}
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePriority}
            disabled={loading === "priority"}
            className="gap-1.5"
          >
            {job.priority === 1 ? (
              <>
                <StarOff className="w-4 h-4 text-yellow-500" />
                Unmark High
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                Mark High Priority
              </>
            )}
          </Button>

          {/* Archive */}
          {job.status !== "archived" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateStatus("archived")}
              disabled={loading === "archived"}
              className="gap-1.5 text-muted-foreground"
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>
          )}

          {/* Current status */}
          <div className="ml-auto">
            <Badge variant="secondary">Status: {job.status}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
