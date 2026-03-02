"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const STATUS_ORDER = [
  "draft",
  "human_review",
  "submitted",
  "interviewing",
  "offer",
  "rejected",
  "ghosted",
];

type Props = {
  appId: string;
  currentStatus: string;
};

export function KanbanActions({ appId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const canForward = currentIndex < STATUS_ORDER.length - 1 && currentIndex >= 0;
  const canBack = currentIndex > 0;

  // Skip forward through "human_review" straight to "submitted" only via human approval
  const nextStatus =
    currentStatus === "human_review"
      ? null // Must use packet editor for this transition
      : canForward
      ? STATUS_ORDER[currentIndex + 1]
      : null;
  const prevStatus = canBack ? STATUS_ORDER[currentIndex - 1] : null;

  async function move(status: string) {
    setLoading(status);
    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-1 pt-1">
      {prevStatus && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs"
          onClick={() => move(prevStatus)}
          disabled={loading !== null}
        >
          {loading === prevStatus ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      )}
      {nextStatus && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs"
          onClick={() => move(nextStatus)}
          disabled={loading !== null}
        >
          {loading === nextStatus ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {nextStatus}
        </Button>
      )}
    </div>
  );
}
