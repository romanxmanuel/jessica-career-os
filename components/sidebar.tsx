"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  CheckSquare,
  MessageSquare,
  FileText,
  Target,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/hunt",
    label: "Today's Hunt",
    description: "Find & apply to jobs",
    icon: Target,
  },
  {
    href: "/",
    label: "My Overview",
    description: "See what needs attention",
    icon: LayoutDashboard,
  },
  {
    href: "/jobs",
    label: "Job List",
    description: "Browse & add jobs",
    icon: Briefcase,
  },
  {
    href: "/tracker",
    label: "My Applications",
    description: "Track where you've applied",
    icon: ClipboardList,
  },
  {
    href: "/sprint",
    label: "Today's To-Do",
    description: "Your tasks for today",
    icon: CheckSquare,
  },
  {
    href: "/outreach",
    label: "Send Messages",
    description: "Follow-up messages",
    icon: MessageSquare,
  },
  {
    href: "/resume",
    label: "My Resume",
    description: "Manage resume versions",
    icon: FileText,
  },
  {
    href: "/dashboard",
    label: "How I'm Doing",
    description: "Metrics & weekly review",
    icon: BarChart2,
  },
];

const STEPS = [
  "Add a job posting",
  "See your fit score",
  "Build your apply packet",
  "Submit & track it",
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card h-screen flex flex-col sticky top-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-card">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
            J
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground leading-tight">
              Jessica's Job Search
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, description, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium leading-tight">{label}</div>
                {!active && (
                  <div className="text-xs opacity-60 leading-tight mt-0.5 truncate">
                    {description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Step Guide */}
      <div className="mx-2 mb-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900">
        <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">
          How it works
        </p>
        <ol className="space-y-1.5">
          {STEPS.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-xs text-purple-800 dark:text-purple-300 leading-tight">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-border space-y-1">
        <p className="text-[10px] text-muted-foreground">
          Press <kbd className="font-mono border border-border rounded px-1 bg-muted">⌘K</kbd> to jump anywhere
        </p>
        <p className="text-[10px] text-muted-foreground leading-snug">
          🔒 Your data stays on your computer. Nothing is auto-submitted.
        </p>
      </div>
    </aside>
  );
}
