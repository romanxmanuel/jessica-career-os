"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-4 border-red-200">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred. Your data is safe — try refreshing the page."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go to Overview
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
        )}
      </Card>
    </div>
  );
}
