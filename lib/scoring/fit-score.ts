// Deterministic fit scoring engine — zero LLM calls.
// All scores are reproducible from the same inputs.

import { extractSkills, extractSeniority, extractIsRemote } from "./keywords";

export interface FitBreakdown {
  skillMatch: number;      // 0–40
  titleSimilarity: number; // 0–20
  seniorityAlignment: number; // 0–15
  locationRemote: number;  // 0–10
  compensation: number;    // 0–10
  companySize: number;     // 0–5
  total: number;           // 0–100
  matchedSkills?: string[]; // skills from JD found in resume
  jdSkillCount?: number;    // total skills JD asked for
  explanation?: string[];   // plain-English bullets for UI
}

interface ScoringInput {
  jobTitle: string;
  rawJd: string;
  resumeHeadline: string;
  resumeSkills: string[];
  resumeYearsExp: number;
  targetRoleLevel: string; // junior | mid | senior | staff | director
  jobRemote?: boolean;
  jobLocation?: string;
  jobSalaryMin?: number | null;
  jobSalaryMax?: number | null;
  targetSalaryMin?: number;
  targetSalaryMax?: number;
}

const SENIORITY_RANK: Record<string, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  staff: 4,
  director: 5,
};

// Simple token overlap for title similarity
function titleOverlap(a: string, b: string): number {
  const tokA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const tokB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  let overlap = 0;
  for (const t of tokA) {
    if (tokB.has(t)) overlap++;
  }
  const union = new Set([...tokA, ...tokB]).size;
  return union === 0 ? 0 : overlap / union;
}

export function computeFitScore(input: ScoringInput): FitBreakdown {
  // 1. Skill Match (0–40)
  const jdSkills = extractSkills(input.rawJd);
  const resumeSkillsLower = input.resumeSkills.map((s) => s.toLowerCase());
  const matched: string[] = [];
  for (const skill of jdSkills) {
    if (resumeSkillsLower.some((rs) => rs.includes(skill) || skill.includes(rs))) {
      matched.push(skill);
    }
  }
  const skillRatio = jdSkills.length > 0 ? matched.length / jdSkills.length : 0;
  const skillMatch = Math.round(skillRatio * 40);

  // 2. Title Similarity (0–20)
  const overlap = titleOverlap(input.jobTitle, input.resumeHeadline);
  const titleSimilarity = Math.round(overlap * 20);

  // 3. Seniority Alignment (0–15)
  const jdSeniority = extractSeniority(input.rawJd + " " + input.jobTitle);
  const jdRank = SENIORITY_RANK[jdSeniority] ?? 2;
  const myRank = SENIORITY_RANK[input.targetRoleLevel] ?? 2;
  const diff = Math.abs(jdRank - myRank);
  const seniorityAlignment = diff === 0 ? 15 : diff === 1 ? 10 : diff === 2 ? 4 : 0;

  // 4. Location / Remote (0–10)
  const jdRemote = input.jobRemote ?? extractIsRemote(input.rawJd);
  const locationRemote = jdRemote ? 10 : 5;

  // 5. Compensation (0–10)
  let compensation = 5; // default neutral
  if (
    input.jobSalaryMin != null &&
    input.targetSalaryMin != null &&
    input.targetSalaryMax != null
  ) {
    const mid = ((input.jobSalaryMin ?? 0) + (input.jobSalaryMax ?? 0)) / 2;
    if (mid >= input.targetSalaryMin && mid <= input.targetSalaryMax) {
      compensation = 10;
    } else if (mid < input.targetSalaryMin * 0.85) {
      compensation = 2;
    } else {
      compensation = 6;
    }
  }

  // 6. Company Size (0–5) — approximate from JD language
  const jdText = input.rawJd.toLowerCase();
  let companySize = 3;
  if (/startup|seed|series [ab]\b/i.test(jdText)) companySize = 5;
  if (/fortune 500|enterprise|publicly traded/i.test(jdText)) companySize = 2;

  const total = Math.min(
    100,
    skillMatch + titleSimilarity + seniorityAlignment + locationRemote + compensation + companySize
  );

  const breakdown: FitBreakdown = {
    skillMatch,
    titleSimilarity,
    seniorityAlignment,
    locationRemote,
    compensation,
    companySize,
    total,
    matchedSkills: matched,
    jdSkillCount: jdSkills.length,
  };

  breakdown.explanation = generateFitExplanation(input, breakdown);

  return breakdown;
}

export function generateFitExplanation(input: ScoringInput, breakdown: FitBreakdown): string[] {
  const bullets: string[] = [];

  // Skill match bullet
  const matched = breakdown.matchedSkills ?? [];
  const jdTotal = breakdown.jdSkillCount ?? 0;
  if (jdTotal === 0) {
    bullets.push("⚠️ No specific skills detected in the job description — score is based on title and location.");
  } else if (matched.length >= jdTotal * 0.7) {
    const preview = matched.slice(0, 5).map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase())).join(", ");
    bullets.push(`✅ ${matched.length} of ${jdTotal} required skills match your resume (${preview}${matched.length > 5 ? "..." : ""})`);
  } else if (matched.length > 0) {
    const preview = matched.slice(0, 4).map((s) => s.replace(/\b\w/g, (c) => c.toUpperCase())).join(", ");
    const missing = jdTotal - matched.length;
    bullets.push(`⚠️ ${matched.length} of ${jdTotal} skills match (${preview}) — ${missing} skill${missing > 1 ? "s" : ""} not found in your resume.`);
  } else {
    bullets.push("❌ None of the detected job skills were found in your resume — review the job description carefully.");
  }

  // Title match bullet
  if (breakdown.titleSimilarity >= 15) {
    bullets.push(`✅ Job title "${input.jobTitle}" closely matches your target role.`);
  } else if (breakdown.titleSimilarity >= 8) {
    bullets.push(`⚠️ Job title "${input.jobTitle}" is related to your experience but not an exact match.`);
  } else {
    bullets.push(`❌ Job title "${input.jobTitle}" is quite different from your typical role — review before applying.`);
  }

  // Location / remote bullet
  const jdRemote = input.jobRemote ?? false;
  if (jdRemote) {
    bullets.push("✅ This is a remote position — no commute required.");
  } else if (input.jobLocation) {
    bullets.push(`✅ Location (${input.jobLocation}) is within your target commute area.`);
  } else {
    bullets.push("⚠️ Location not specified — confirm commute before applying.");
  }

  // Compensation bullet
  if (input.jobSalaryMin != null && input.jobSalaryMax != null) {
    const salaryText = `$${(input.jobSalaryMin / 1000).toFixed(0)}k–$${(input.jobSalaryMax / 1000).toFixed(0)}k`;
    if (breakdown.compensation >= 9) {
      bullets.push(`✅ Salary range ${salaryText} is within your target range.`);
    } else if (breakdown.compensation <= 3) {
      bullets.push(`❌ Salary range ${salaryText} may be below your target — confirm before applying.`);
    } else {
      bullets.push(`⚠️ Salary range ${salaryText} is close to your target range.`);
    }
  } else {
    bullets.push("⚠️ Salary not listed — unable to score compensation fit. Ask in the interview.");
  }

  return bullets;
}

export function fitScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Moderate";
  if (score >= 40) return "Low";
  return "Poor";
}

export function fitScoreColor(score: number): string {
  if (score >= 85) return "text-green-700";
  if (score >= 70) return "text-blue-700";
  if (score >= 55) return "text-yellow-700";
  return "text-red-600";
}

export function fitScoreBg(score: number): string {
  if (score >= 85) return "bg-green-100";
  if (score >= 70) return "bg-blue-100";
  if (score >= 55) return "bg-yellow-100";
  return "bg-red-100";
}
