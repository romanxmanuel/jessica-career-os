"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  CheckSquare,
  MessageSquare,
  FileText,
  BarChart2,
  Plus,
  Search,
} from "lucide-react";

interface Command {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: "hunt",
      label: "Today's Hunt",
      description: "Find new jobs and build packets",
      icon: Target,
      action: () => router.push("/hunt"),
    },
    {
      id: "new-job",
      label: "Add a New Job",
      description: "Paste a job description and get scored",
      shortcut: "n",
      icon: Plus,
      action: () => router.push("/jobs/new"),
    },
    {
      id: "overview",
      label: "My Overview",
      description: "Home dashboard",
      icon: LayoutDashboard,
      action: () => router.push("/"),
    },
    {
      id: "jobs",
      label: "Job List",
      description: "Browse all jobs",
      icon: Briefcase,
      action: () => router.push("/jobs"),
    },
    {
      id: "tracker",
      label: "My Applications",
      description: "Kanban pipeline tracker",
      icon: ClipboardList,
      action: () => router.push("/tracker"),
    },
    {
      id: "sprint",
      label: "Today's To-Do",
      description: "Daily sprint + follow-ups",
      icon: CheckSquare,
      action: () => router.push("/sprint"),
    },
    {
      id: "outreach",
      label: "Send Messages",
      description: "Outreach messages and contacts",
      icon: MessageSquare,
      action: () => router.push("/outreach"),
    },
    {
      id: "resume",
      label: "My Resume",
      description: "Manage resume versions",
      icon: FileText,
      action: () => router.push("/resume"),
    },
    {
      id: "dashboard",
      label: "How I'm Doing",
      description: "KPI metrics and weekly review",
      icon: BarChart2,
      action: () => router.push("/dashboard"),
    },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const runSelected = useCallback(() => {
    const cmd = filtered[selectedIndex];
    if (cmd) {
      cmd.action();
      setOpen(false);
      setQuery("");
    }
  }, [filtered, selectedIndex]);

  // Global keyboard handler
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Open: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
        return;
      }

      // Close on Escape
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      // Shortcut "n" for new job (only when not in an input)
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag !== "input" && tag !== "textarea" && !e.metaKey && !e.ctrlKey) {
        if (e.key === "n") {
          e.preventDefault();
          window.location.href = "/jobs/new";
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Handle arrow keys + enter inside the palette
  function onPaletteKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runSelected();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-md mx-4 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onPaletteKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or jump to..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Commands list */}
        <ul className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <li key={cmd.id}>
                  <button
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      idx === selectedIndex
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      cmd.action();
                      setOpen(false);
                      setQuery("");
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left font-medium">{cmd.label}</span>
                    <span
                      className={`text-xs ${
                        idx === selectedIndex
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {cmd.description}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={`text-[10px] border rounded px-1.5 py-0.5 ${
                          idx === selectedIndex
                            ? "border-primary-foreground/30"
                            : "border-border"
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
          <span className="ml-auto">Press <kbd className="border border-border rounded px-1">n</kbd> anywhere for new job</span>
        </div>
      </div>
    </div>
  );
}
