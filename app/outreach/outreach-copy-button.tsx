"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

type Props = { message: string };

export function OutreachCopyButton({ message }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy Message
        </>
      )}
    </Button>
  );
}
