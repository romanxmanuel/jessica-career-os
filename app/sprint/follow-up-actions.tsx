"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Loader2 } from "lucide-react";

type Props = {
  followUpId: string;
};

export function FollowUpActions({ followUpId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function mark(status: "sent" | "skipped") {
    setLoading(status);
    try {
      await fetch("/api/follow-ups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: followUpId, status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-1.5 shrink-0">
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 gap-1 text-xs"
        onClick={() => mark("sent")}
        disabled={loading !== null}
      >
        {loading === "sent" ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <CheckCircle2 className="w-3 h-3 text-green-600" />
        )}
        Sent
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 px-2 gap-1 text-xs text-muted-foreground"
        onClick={() => mark("skipped")}
        disabled={loading !== null}
      >
        <X className="w-3 h-3" />
        Skip
      </Button>
    </div>
  );
}
