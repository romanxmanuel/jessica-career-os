/**
 * Minimal demo seed — used by lib/db.ts on Vercel cold starts.
 * Inserts just enough data to demonstrate all app features.
 * For full realistic demo data, run: npm run db:seed
 */
import * as schema from "./schema";
import { createId } from "@paralleldrive/cuid2";
import { addDays, subDays } from "date-fns";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function seedDemo(db: any) {
  const now = new Date();

  // ── Resume Profile ────────────────────────────────────────────────
  const resumeId = createId();
  db.insert(schema.resumeProfiles).values({
    id: resumeId,
    label: "Accounts Receivable Specialist",
    headline:
      "Accounts Receivable Specialist | 10+ Years | Salesforce · SAP · NetSuite | B2B Collections | Billing & Dispute Resolution",
    content: `JESSICA L. HERMAN
Orlando, FL | jessica.breakthrough@outlook.com

PROFESSIONAL SUMMARY
Accounts Receivable Specialist with 10+ years of experience managing billing, collections, and dispute resolution. Skilled in researching payment discrepancies, reconciling customer accounts, and sustaining steady cash flow. Experienced with Salesforce, NetSuite, and SAP. Known for clear customer communication, accurate documentation, and consistent follow-through.

CORE COMPETENCIES
Accounts Receivable · B2B Collections · Billing & Invoicing · Account Reconciliation · Dispute Resolution · Cash Application · Payment Posting · AR Aging · GL Adjustments · Credit Holds · DSO Management

TECHNICAL SKILLS
Salesforce · SAP · NetSuite · Excel (PivotTables, VLookup) · QuickBooks

WORK EXPERIENCE
Accounts Receivable Specialist | Wyndham Destinations | 2020–Present
- Managed $2M+ monthly AR portfolio for 300+ corporate accounts
- Reduced DSO from 47 to 31 days through systematic follow-up process
- Resolved 150+ monthly billing disputes with 94% first-contact resolution rate
- Applied cash receipts and reconciled daily deposits up to $500K

AR / Billing Specialist | University of Central Florida | 2015–2020
- Processed tuition billing for 8,000+ student accounts per semester
- Managed collections on $1.2M in past-due balances; recovered 78% within 90 days
- Collaborated with registrar and financial aid on complex account adjustments

EDUCATION
Bachelor of Science, Business Administration | UCF | 2014

CERTIFICATIONS
SHRM-CP (2019) · Salesforce CRM Certified User`,
    skills: JSON.stringify([
      "accounts receivable", "collections", "b2b collections", "billing", "invoicing",
      "dispute resolution", "cash application", "payment posting", "ar aging",
      "reconciliation", "gl adjustments", "credit holds", "dso", "netsuite",
      "sap", "salesforce", "quickbooks", "excel", "vlookup", "pivot tables", "shrm-cp",
    ]),
    yearsExperience: 10,
    targetRoleLevel: "mid",
    isDefault: true,
    createdAt: now,
  }).run();

  // ── Jobs ──────────────────────────────────────────────────────────
  const job1Id = createId();
  const job2Id = createId();
  const job3Id = createId();
  const job4Id = createId();

  db.insert(schema.jobs).values([
    {
      id: job1Id,
      title: "Accounts Receivable Specialist",
      company: "Darden Restaurants",
      location: "Lake Buena Vista, FL",
      remote: false,
      url: "https://jobs.darden.com/ar-specialist",
      rawJd: "Manage AR portfolio for corporate accounts. 3+ years AR experience required. Proficiency in SAP and Excel. Responsibilities include billing, collections, reconciliation, and dispute resolution. Salary $48,000–$58,000.",
      parsedSkills: JSON.stringify(["accounts receivable", "sap", "excel", "collections", "reconciliation", "billing", "dispute resolution"]),
      fitScore: 92,
      fitBreakdown: JSON.stringify({
        skillMatch: 36, titleSimilarity: 20, seniorityAlignment: 15,
        locationRemote: 8, compensation: 8, companySize: 5, total: 92,
        matchedSkills: ["sap", "excel", "collections", "reconciliation", "billing", "dispute resolution"],
        explanation: [
          "✅ 6 of 7 required skills match your resume (SAP, Excel, Collections, Reconciliation, Billing, Dispute Resolution)",
          "✅ Job title matches your target role directly",
          "✅ Salary range ($48k–$58k) aligns with your target compensation",
          "✅ Location (Lake Buena Vista, FL) is within your commute range",
        ],
      }),
      salaryMin: 48000,
      salaryMax: 58000,
      status: "queued",
      priority: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: job2Id,
      title: "AR Billing Specialist",
      company: "AdventHealth",
      location: "Altamonte Springs, FL",
      remote: false,
      url: "https://careers.adventhealth.com/ar-billing",
      rawJd: "Process insurance and patient billing, resolve payment disputes, manage collections on past-due accounts. Must have NetSuite or similar ERP experience. Strong Excel skills required. 2+ years billing experience.",
      parsedSkills: JSON.stringify(["billing", "netsuite", "excel", "collections", "dispute resolution", "payment posting"]),
      fitScore: 85,
      fitBreakdown: JSON.stringify({
        skillMatch: 32, titleSimilarity: 16, seniorityAlignment: 15,
        locationRemote: 8, compensation: 9, companySize: 5, total: 85,
        matchedSkills: ["billing", "netsuite", "excel", "collections", "dispute resolution", "payment posting"],
        explanation: [
          "✅ 6 of 6 required skills match your resume (Billing, NetSuite, Excel, Collections, Dispute Resolution, Payment Posting)",
          "✅ Location (Altamonte Springs, FL) is within your commute range",
          "⚠️ Title is AR/Billing hybrid — slightly below your Specialist target level",
          "⚠️ Salary not listed — ask about compensation range in the interview",
        ],
      }),
      status: "queued",
      priority: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: job3Id,
      title: "Accounts Receivable Coordinator",
      company: "Siemens Energy",
      location: "Lake Mary, FL",
      remote: true,
      url: "https://jobs.siemens-energy.com/ar-coordinator",
      rawJd: "Support AR team with cash application, aging report review, and customer account reconciliation. Entry to mid-level. Salesforce experience a plus. Must be proficient in Excel and have strong communication skills.",
      parsedSkills: JSON.stringify(["cash application", "ar aging", "reconciliation", "salesforce", "excel"]),
      fitScore: 78,
      fitBreakdown: JSON.stringify({
        skillMatch: 28, titleSimilarity: 14, seniorityAlignment: 10,
        locationRemote: 10, compensation: 11, companySize: 5, total: 78,
        matchedSkills: ["cash application", "ar aging", "reconciliation", "salesforce", "excel"],
        explanation: [
          "✅ 5 of 5 required skills match your resume (Cash Application, AR Aging, Reconciliation, Salesforce, Excel)",
          "✅ Remote-friendly role",
          "⚠️ Title is Coordinator — one level below your Specialist experience",
          "⚠️ Salary not listed — clarify range before applying",
        ],
      }),
      status: "new",
      priority: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: job4Id,
      title: "Accounts Receivable Specialist",
      company: "Watsco Inc",
      location: "Orlando, FL",
      remote: false,
      url: "https://careers.watsco.com/ar-specialist",
      rawJd: "Manage full-cycle AR for B2B distribution accounts. Handle credit decisions, collections calls, dispute resolution, and payment application. SAP required. 5+ years experience. Salary $55,000–$65,000.",
      parsedSkills: JSON.stringify(["b2b collections", "sap", "credit holds", "dispute resolution", "cash application", "accounts receivable"]),
      fitScore: 94,
      fitBreakdown: JSON.stringify({
        skillMatch: 38, titleSimilarity: 20, seniorityAlignment: 15,
        locationRemote: 8, compensation: 8, companySize: 5, total: 94,
        matchedSkills: ["b2b collections", "sap", "credit holds", "dispute resolution", "cash application", "accounts receivable"],
        explanation: [
          "✅ 6 of 6 required skills match your resume (B2B Collections, SAP, Credit Holds, Dispute Resolution, Cash Application, AR)",
          "✅ Job title matches your target role directly",
          "✅ Salary range ($55k–$65k) meets your target compensation",
          "✅ Location (Orlando, FL) is within your commute range",
        ],
      }),
      salaryMin: 55000,
      salaryMax: 65000,
      status: "applied",
      priority: 1,
      createdAt: subDays(now, 5),
      updatedAt: subDays(now, 5),
    },
  ]).run();

  // ── Applications ──────────────────────────────────────────────────
  const app1Id = createId();
  const app2Id = createId();
  const app3Id = createId();

  db.insert(schema.applications).values([
    {
      id: app1Id,
      jobId: job1Id,
      resumeId: resumeId,
      status: "draft",
      coverLetter: null,
      tailoredResume: null,
      screeningQa: null,
      outreachMessage: null,
      humanApprovedAt: null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: app2Id,
      jobId: job2Id,
      resumeId: resumeId,
      status: "draft",
      coverLetter: null,
      tailoredResume: null,
      screeningQa: null,
      outreachMessage: null,
      humanApprovedAt: null,
      submittedAt: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: app3Id,
      jobId: job4Id,
      resumeId: resumeId,
      status: "submitted",
      coverLetter: "Dear Watsco Hiring Team,\n\nI am writing to express my strong interest in the Accounts Receivable Specialist position at Watsco Inc. With over 10 years of B2B collections and AR management experience, including expertise in SAP and dispute resolution, I am confident I can contribute immediately to your finance team.\n\nAt Wyndham Destinations, I managed a $2M+ monthly AR portfolio and reduced DSO from 47 to 31 days. I am excited to bring that same focus on results to Watsco.\n\nThank you for your consideration.\n\nBest regards,\nJessica L. Herman",
      tailoredResume: "• Managed $2M+ monthly B2B AR portfolio for 300+ corporate accounts using SAP\n• Reduced DSO from 47 to 31 days through systematic collections follow-up process\n• Resolved 150+ monthly billing disputes with 94% first-contact resolution rate\n• Applied daily cash receipts up to $500K; reconciled deposits and cleared aging items",
      screeningQa: JSON.stringify([
        { question: "How many years of AR experience do you have?", answer: "10+ years managing full-cycle accounts receivable, including B2B collections, billing, dispute resolution, and cash application." },
        { question: "Do you have SAP experience?", answer: "Yes — I used SAP daily at Wyndham Destinations to research invoices, post payments, and reconcile customer accounts." },
      ]),
      outreachMessage: "Hi [Recruiter Name],\n\nI recently applied for the AR Specialist role at Watsco and wanted to introduce myself. I have 10+ years of B2B AR experience with SAP expertise and a strong track record in collections and dispute resolution.\n\nI'd love to connect if you have a few minutes.\n\nBest,\nJessica",
      humanApprovedAt: subDays(now, 5),
      submittedAt: subDays(now, 5),
      createdAt: subDays(now, 5),
      updatedAt: subDays(now, 5),
    },
  ]).run();

  // ── Follow-ups ────────────────────────────────────────────────────
  db.insert(schema.followUps).values([
    {
      id: createId(),
      applicationId: app3Id,
      dueDate: addDays(subDays(now, 5), 7),
      type: "week1",
      status: "pending",
      message: "Hi [Recruiter Name], I wanted to follow up on my application for the AR Specialist role submitted last week. I remain very interested and would welcome the chance to discuss how my SAP and B2B collections experience aligns with your team's needs. Thank you!",
      createdAt: subDays(now, 5),
    },
  ]).run();
}
