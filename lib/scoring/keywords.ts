// Deterministic keyword extraction — no LLM involved.
// Extracts skills and requirements from job description text.
// Tuned for Accounts Receivable Specialist + HR Operations roles (Jessica L. Herman).

const SKILL_GLOSSARY = new Set([
  // Accounts Receivable & Collections core
  "accounts receivable", "ar", "collections", "b2b collections", "commercial collections",
  "billing", "invoicing", "invoice", "invoices", "credit", "credit holds", "credit memos",
  "cash application", "payment posting", "cash posting", "remittance",
  "dispute resolution", "dispute management", "short-pay", "short pay", "deductions",
  "ar aging", "aging report", "aging analysis", "dso", "days sales outstanding",
  "reconciliation", "account reconciliation", "gl adjustments", "general ledger",
  "payment plans", "payment arrangements", "collections strategy",
  "dunning", "dunning letters", "demand letters", "collection calls",
  "lien waivers", "ucc filings", "bad debt", "write-offs", "charge-offs",

  // Finance & Accounting
  "accounts payable", "ap", "general ledger", "month-end close", "month end",
  "year-end close", "financial reporting", "bank reconciliation",
  "journal entries", "accruals", "balance sheet", "income statement",
  "cash flow", "revenue recognition", "gaap", "sox", "audit", "internal controls",

  // ERP & Accounting Software
  "netsuite", "sap", "sap s/4hana", "oracle", "oracle financials", "dynamics",
  "microsoft dynamics", "quickbooks", "sage", "sage intacct", "great plains",
  "epicor", "infor", "yardi", "mas 90", "mas 200", "blackline",

  // CRM & Collection Tools
  "salesforce", "hubspot", "getpaid", "highradius", "order-to-cash",
  "o2c", "cforia", "billtrust", "esker", "cash application software",

  // Productivity & Data
  "excel", "microsoft excel", "vlookup", "pivot tables", "pivottables",
  "macros", "power query", "data analysis", "reporting", "dashboard",
  "microsoft office", "microsoft 365", "google sheets", "word", "outlook",

  // HR Operations (secondary focus)
  "shrm-cp", "shrm", "human resources", "hr operations", "hr administration",
  "onboarding", "offboarding", "new hire", "orientation", "benefits administration",
  "payroll", "hris", "hcm", "ukg", "gusto", "adp", "workday", "bamboohr",
  "performance management", "employee relations", "conflict resolution",
  "training", "learning and development", "l&d", "compliance", "fmla", "ada",
  "i-9", "e-verify", "job descriptions", "recruiting", "talent acquisition",
  "workforce planning", "succession planning", "org charts",

  // Soft skills & competencies (frequently required in JDs)
  "communication", "customer service", "customer relations", "problem solving",
  "attention to detail", "detail-oriented", "multi-task", "multitask", "prioritization",
  "team player", "collaborative", "cross-functional", "process improvement",
  "time management", "organizational skills", "analytical", "critical thinking",
  "negotiation", "relationship management", "stakeholder management",

  // Job-type keywords (used in title/seniority matching)
  "accounts receivable specialist", "ar specialist", "billing specialist",
  "collections specialist", "credit and collections", "credit analyst",
  "billing coordinator", "ar coordinator", "revenue cycle", "billing analyst",
  "finance coordinator", "accounting specialist", "accounting assistant",
  "hr specialist", "hr coordinator", "hr generalist", "hr operations specialist",
]);

const SENIORITY_PATTERNS: Record<string, RegExp[]> = {
  junior: [/\bjunior\b/i, /\b1[\-–]2 years?\b/i, /\b0[\-–]2 years?\b/i],
  mid: [/\bmid[\-\s]level\b/i, /\b3[\-–]5 years?\b/i, /\b2[\-–]4 years?\b/i],
  senior: [/\bsenior\b/i, /\b5\+? years?\b/i, /\b7\+? years?\b/i, /\b6[\-–]8 years?\b/i],
  staff: [/\bstaff\b/i, /\bprincipal\b/i, /\b8\+? years?\b/i, /\b10\+? years?\b/i],
  director: [
    /\bdirector\b/i,
    /\bgroup pm\b/i,
    /\bvp of product\b/i,
    /\bhead of product\b/i,
    /\b10\+? years?\b/i,
  ],
};

const REMOTE_PATTERNS = [
  /\bremote\b/i,
  /\bwork from home\b/i,
  /\bwfh\b/i,
  /\bfully remote\b/i,
  /\bhybrid\b/i,
];

export function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const skill of SKILL_GLOSSARY) {
    if (lower.includes(skill)) {
      found.push(skill);
    }
  }
  return [...new Set(found)];
}

export function extractSeniority(text: string): string {
  for (const [level, patterns] of Object.entries(SENIORITY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return level;
      }
    }
  }
  return "mid";
}

export function extractIsRemote(text: string): boolean {
  return REMOTE_PATTERNS.some((p) => p.test(text));
}

export function extractSalary(text: string): { min: number | null; max: number | null } {
  // Match patterns like $180,000–$240,000 or $180k-$240k or 180000 - 240000
  const salaryPattern =
    /\$?([\d,]+)[kK]?\s*[-–—to]+\s*\$?([\d,]+)[kK]?/g;
  const match = salaryPattern.exec(text);
  if (!match) return { min: null, max: null };

  let min = parseInt(match[1].replace(/,/g, ""), 10);
  let max = parseInt(match[2].replace(/,/g, ""), 10);

  // Handle "k" suffix
  if (/k/i.test(match[0])) {
    if (min < 1000) min *= 1000;
    if (max < 1000) max *= 1000;
  }

  return { min, max };
}
