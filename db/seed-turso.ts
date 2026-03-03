/**
 * Seeds the Turso cloud database with Jessica's demo data.
 * Run with: npx tsx db/seed-turso.ts
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { createId } from "@paralleldrive/cuid2";
import { addDays, subDays } from "date-fns";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Set TURSO_DATABASE_URL before running this script.");
  process.exit(1);
}

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

const now = new Date();

async function seed() {
  // Clear all tables (children first to respect FK order)
  await db.delete(schema.followUps).run();
  await db.delete(schema.applications).run();
  await db.delete(schema.contacts).run();
  await db.delete(schema.dailySprints).run();
  await db.delete(schema.jobs).run();
  await db.delete(schema.resumeProfiles).run();

  // ── Resume Profiles ──────────────────────────────────────────────
  const resumeIdAR = createId();
  const resumeIdHR = createId();

  await db.insert(schema.resumeProfiles).values([
    {
      id: resumeIdAR,
      label: "Accounts Receivable Specialist",
      headline: "Accounts Receivable Specialist | 10+ Years | Salesforce · SAP · NetSuite | B2B Collections | Billing & Dispute Resolution",
      content: `JESSICA L. HERMAN
Orlando, FL | jessica.breakthrough@outlook.com | LinkedIn.com/in/jessicalherman

PROFESSIONAL SUMMARY
Accounts Receivable Specialist with 10+ years of experience managing billing, collections, and dispute resolution across corporate and education environments. Skilled in researching payment discrepancies, reconciling customer accounts, and sustaining steady cash flow. Experienced with Salesforce, NetSuite, and SAP to research invoices, payments, and account reconciliation. Known for clear customer communication, accurate documentation, and consistent follow-through.

CORE COMPETENCIES
Accounts Receivable · Customer Billing & Invoicing · B2B Collections · Account Reconciliation · Credit Holds & Credit Decisions · Aging Report Review & Follow-Up · Dispute Resolution & Short-Pay Research · Cash Application & Payment Posting · Refunds & GL Adjustments · Contract and Pricing Variance Investigation

TECHNICAL SKILLS
Salesforce · SAP · NetSuite · Excel (PivotTables, Lookups) · LMS/Student Platforms · Ticketing/Case Management

WORK EXPERIENCE
Billing & Collections Specialist | Colibri Group | 2021–2025
- Managed 20–40 accounts per day using Salesforce and NetSuite for B2B and government clients
- Investigated pricing variances, payment plans, disputed invoices, and short-pays
- Maintained AR aging, applied cash receipts, and escalated unresolved balances

Accounts Receivable Specialist | SKF Group | 2019
- Reported weekly on $20K+ accounts to Credit Manager and Controller using SAP
- Trained new AR team members on dispute documentation workflows
- Managed collections calls and reconciliation for industrial supply accounts

Senior Credit Analyst | Anheuser-Busch | 2011–2016
- Generated DSO reports using SAP; built pricing macros to speed invoice review
- Authorized credit decisions on accounts up to $500K
- Participated in Lean Six Sigma process improvement for AR workflow

Collections Specialist | Smurfit-Stone | 2010–2011
- Managed 125+ accounts per week using SAP dispute documentation
- Investigated short-pay and pricing discrepancies across packaging accounts

Accounts Receivable Analyst | Star Manufacturing (Middleby Corp) | 2007–2010
- Full-cycle AR for commercial kitchen equipment distributor accounts
- Reconciled GL adjustments, processed refunds, maintained credit holds

AR & Student Accounts | University of Central Florida | 2015–2020
- Processed tuition billing for 8,000+ student accounts per semester
- Recovered 78% of $1.2M past-due balances within 90 days

EDUCATION
M.A. Applied Communication Studies | SIUE | 2018
B.S. Psychology & Communication | Missouri State University

CERTIFICATIONS
SHRM-CP (July 2025) · Certificate in Conflict & Dispute Resolution`,
      skills: JSON.stringify([
        "accounts receivable", "ar", "collections", "b2b collections", "billing", "invoicing",
        "dispute resolution", "short-pay", "cash application", "payment posting", "ar aging",
        "reconciliation", "gl adjustments", "credit holds", "dso", "netsuite", "sap",
        "salesforce", "quickbooks", "excel", "vlookup", "pivot tables", "shrm-cp",
        "conflict resolution", "training", "credit decisions", "payment plans",
      ]),
      yearsExperience: 10,
      targetRoleLevel: "mid",
      isDefault: true,
      createdAt: now,
    },
    {
      id: resumeIdHR,
      label: "HR Operations / People Operations",
      headline: "HR Operations Specialist | SHRM-CP | Onboarding · Training · UKG · Gusto · Conflict Resolution",
      content: `JESSICA L. HERMAN
Orlando, FL | jessica.breakthrough@outlook.com | LinkedIn.com/in/jessicalherman

PROFESSIONAL SUMMARY
HR Operations professional with SHRM-CP certification and 10+ years of cross-functional experience in onboarding, training design, conflict resolution, and employee relations. Background in high-volume environments with strong documentation, communication, and people management skills.

CORE COMPETENCIES
HR Onboarding & Offboarding · Training Design & Facilitation · Conflict & Dispute Resolution · SOP Documentation · Employee Relations · HRIS (UKG, Gusto) · Benefits Administration Support · Compliance Recordkeeping

CERTIFICATIONS
SHRM-CP (July 2025) · Certificate in Conflict & Dispute Resolution`,
      skills: JSON.stringify([
        "hr operations", "onboarding", "training", "shrm-cp", "conflict resolution",
        "ukg", "gusto", "sop", "employee relations", "benefits", "hris",
      ]),
      yearsExperience: 10,
      targetRoleLevel: "mid",
      isDefault: false,
      createdAt: now,
    },
  ]).run();

  // ── Jobs ────────────────────────────────────────────────────────
  const j1 = createId(), j2 = createId(), j3 = createId(), j4 = createId();
  const j5 = createId(), j6 = createId(), j7 = createId(), j8 = createId();
  const j9 = createId(), j10 = createId();

  await db.insert(schema.jobs).values([
    {
      id: j1,
      title: "Accounts Receivable Specialist",
      company: "Darden Restaurants",
      location: "Lake Buena Vista, FL",
      remote: false,
      url: "https://www.darden.com/careers",
      rawJd: "Manage AR portfolio for corporate accounts. 3+ years AR experience required. SAP and Excel proficiency. Billing, collections, reconciliation, dispute resolution. Salary $48,000–$58,000.",
      parsedSkills: JSON.stringify(["accounts receivable","sap","excel","collections","reconciliation","billing","dispute resolution"]),
      fitScore: 92,
      fitBreakdown: JSON.stringify({ skillMatch:36, titleSimilarity:20, seniorityAlignment:15, locationRemote:8, compensation:8, companySize:5, total:92, matchedSkills:["sap","excel","collections","reconciliation","billing","dispute resolution"], explanation:["✅ 6 of 7 required skills match your resume (SAP, Excel, Collections, Reconciliation, Billing, Dispute Resolution)","✅ Job title matches your target role directly","✅ Salary range ($48k–$58k) aligns with your target","✅ Location (Lake Buena Vista, FL) is within your commute range"] }),
      salaryMin: 48000, salaryMax: 58000,
      status: "queued", priority: 1,
      createdAt: now, updatedAt: now,
    },
    {
      id: j2,
      title: "AR Billing Specialist",
      company: "AdventHealth",
      location: "Altamonte Springs, FL",
      remote: false,
      url: "https://careers.adventhealth.com",
      rawJd: "Process insurance and patient billing, resolve payment disputes, manage collections. NetSuite or similar ERP experience. Strong Excel required. 2+ years billing.",
      parsedSkills: JSON.stringify(["billing","netsuite","excel","collections","dispute resolution","payment posting"]),
      fitScore: 85,
      fitBreakdown: JSON.stringify({ skillMatch:32, titleSimilarity:16, seniorityAlignment:15, locationRemote:8, compensation:9, companySize:5, total:85, matchedSkills:["billing","netsuite","excel","collections","dispute resolution","payment posting"], explanation:["✅ 6 of 6 skills match your resume (Billing, NetSuite, Excel, Collections, Dispute Resolution, Payment Posting)","✅ Location (Altamonte Springs, FL) is within your commute range","⚠️ Title is AR/Billing hybrid — slightly below your Specialist level","⚠️ Salary not listed — ask about range in the interview"] }),
      status: "queued", priority: 0,
      createdAt: now, updatedAt: now,
    },
    {
      id: j3,
      title: "Accounts Receivable Coordinator",
      company: "Siemens Energy",
      location: "Lake Mary, FL",
      remote: true,
      url: "https://jobs.siemens-energy.com/careers",
      rawJd: "Support AR team with cash application, aging report review, and account reconciliation. Salesforce a plus. Excel and strong communication required.",
      parsedSkills: JSON.stringify(["cash application","ar aging","reconciliation","salesforce","excel"]),
      fitScore: 78,
      fitBreakdown: JSON.stringify({ skillMatch:28, titleSimilarity:14, seniorityAlignment:10, locationRemote:10, compensation:11, companySize:5, total:78, matchedSkills:["cash application","ar aging","reconciliation","salesforce","excel"], explanation:["✅ 5 of 5 skills match your resume (Cash Application, AR Aging, Reconciliation, Salesforce, Excel)","✅ Remote-friendly role","⚠️ Title is Coordinator — one level below your Specialist experience","⚠️ Salary not listed — clarify range before applying"] }),
      status: "new", priority: 0,
      createdAt: now, updatedAt: now,
    },
    {
      id: j4,
      title: "Accounts Receivable Specialist",
      company: "Watsco Inc",
      location: "Orlando, FL",
      remote: false,
      url: "https://www.watsco.com/careers",
      rawJd: "Manage full-cycle AR for B2B distribution accounts. Credit decisions, collections, dispute resolution, payment application. SAP required. 5+ years experience. Salary $55,000–$65,000.",
      parsedSkills: JSON.stringify(["b2b collections","sap","credit holds","dispute resolution","cash application","accounts receivable"]),
      fitScore: 94,
      fitBreakdown: JSON.stringify({ skillMatch:38, titleSimilarity:20, seniorityAlignment:15, locationRemote:8, compensation:8, companySize:5, total:94, matchedSkills:["b2b collections","sap","credit holds","dispute resolution","cash application","accounts receivable"], explanation:["✅ 6 of 6 skills match your resume (B2B Collections, SAP, Credit Holds, Dispute Resolution, Cash Application, AR)","✅ Job title matches your target role directly","✅ Salary range ($55k–$65k) meets your target","✅ Location (Orlando, FL) is within your commute range"] }),
      salaryMin: 55000, salaryMax: 65000,
      status: "applied", priority: 1,
      createdAt: subDays(now, 5), updatedAt: subDays(now, 5),
    },
    {
      id: j5,
      title: "Accounts Receivable Specialist",
      company: "Florida Orthopaedic Institute",
      location: "Tampa, FL",
      remote: false,
      url: "https://www.floridaortho.com/careers",
      rawJd: "Handle patient and insurance billing, collections follow-up, and payment posting. Experience with medical billing software. Excel required. 3+ years AR in healthcare.",
      parsedSkills: JSON.stringify(["billing","collections","payment posting","excel","ar aging","reconciliation"]),
      fitScore: 80,
      fitBreakdown: JSON.stringify({ skillMatch:30, titleSimilarity:20, seniorityAlignment:15, locationRemote:5, compensation:5, companySize:5, total:80, matchedSkills:["billing","collections","payment posting","excel","ar aging"], explanation:["✅ 5 of 6 skills match your resume (Billing, Collections, Payment Posting, Excel, AR Aging)","✅ Job title matches your target role directly","⚠️ Healthcare AR is a specialty — highlight any medical billing adjacent experience","⚠️ Tampa location — longer commute from Oviedo"] }),
      status: "new", priority: 0,
      createdAt: subDays(now, 2), updatedAt: subDays(now, 2),
    },
    {
      id: j6,
      title: "Billing Specialist",
      company: "Brown & Brown Insurance",
      location: "Daytona Beach, FL",
      remote: false,
      url: "https://www.bbins.com/about/careers",
      rawJd: "Process premium billing, manage payment collections, resolve billing disputes. Experience with insurance billing platforms. Excel required. Salesforce a plus. 2+ years billing.",
      parsedSkills: JSON.stringify(["billing","collections","dispute resolution","salesforce","excel","payment posting"]),
      fitScore: 82,
      fitBreakdown: JSON.stringify({ skillMatch:32, titleSimilarity:14, seniorityAlignment:15, locationRemote:5, compensation:11, companySize:5, total:82, matchedSkills:["billing","collections","dispute resolution","salesforce","excel"], explanation:["✅ 5 of 6 skills match your resume (Billing, Collections, Dispute Resolution, Salesforce, Excel)","✅ Salesforce experience is a direct match","⚠️ Insurance billing is a specialty — slightly different than B2B AR","⚠️ Daytona Beach — long commute, consider whether remote is negotiable"] }),
      status: "archived", priority: -1,
      createdAt: subDays(now, 7), updatedAt: subDays(now, 7),
    },
    {
      id: j7,
      title: "AR Collections Specialist",
      company: "Tavistock Group",
      location: "Lake Nona, FL",
      remote: false,
      url: "https://tavistock.com/careers",
      rawJd: "Manage B2B collections for real estate and hospitality portfolio. SAP or NetSuite experience preferred. Dispute resolution and credit hold management. 5+ years experience preferred. Salary $52,000–$62,000.",
      parsedSkills: JSON.stringify(["b2b collections","sap","netsuite","dispute resolution","credit holds","ar aging","reconciliation"]),
      fitScore: 90,
      fitBreakdown: JSON.stringify({ skillMatch:36, titleSimilarity:18, seniorityAlignment:15, locationRemote:8, compensation:8, companySize:5, total:90, matchedSkills:["b2b collections","sap","netsuite","dispute resolution","credit holds","ar aging","reconciliation"], explanation:["✅ 7 of 7 skills match your resume (B2B Collections, SAP, NetSuite, Dispute Resolution, Credit Holds, AR Aging, Reconciliation)","✅ Location (Lake Nona, FL) is in your preferred commute area","✅ Salary range ($52k–$62k) aligns with your target","⚠️ Real estate/hospitality AR is a specialty — but your skills transfer directly"] }),
      salaryMin: 52000, salaryMax: 62000,
      status: "queued", priority: 1,
      createdAt: subDays(now, 1), updatedAt: subDays(now, 1),
    },
    {
      id: j8,
      title: "Accounts Receivable Specialist",
      company: "Wharton-Smith Construction",
      location: "Sanford, FL",
      remote: false,
      url: "https://whartonsmith.com/careers",
      rawJd: "Manage subcontractor billing, lien waivers, and collections for construction projects. Excel and QuickBooks experience preferred. Strong attention to detail required.",
      parsedSkills: JSON.stringify(["billing","collections","excel","quickbooks","reconciliation"]),
      fitScore: 74,
      fitBreakdown: JSON.stringify({ skillMatch:26, titleSimilarity:20, seniorityAlignment:15, locationRemote:8, compensation:0, companySize:5, total:74, matchedSkills:["billing","collections","excel","quickbooks"], explanation:["✅ 4 of 5 skills match your resume (Billing, Collections, Excel, QuickBooks)","✅ Job title matches your target role directly","✅ Location (Sanford, FL) is in your preferred commute area","⚠️ Construction AR uses lien waivers — niche knowledge, but billing skills transfer","⚠️ Salary not listed"] }),
      status: "new", priority: 0,
      createdAt: subDays(now, 3), updatedAt: subDays(now, 3),
    },
    {
      id: j9,
      title: "Accounts Receivable Specialist",
      company: "Lockheed Martin",
      location: "Orlando, FL",
      remote: false,
      url: "https://www.lockheedmartinjobs.com",
      rawJd: "Support government contract billing and collections. SAP required. Security clearance preferred but not required. Must have strong reconciliation and dispute resolution skills. 5+ years. $58,000–$72,000.",
      parsedSkills: JSON.stringify(["accounts receivable","sap","reconciliation","dispute resolution","billing","collections","gl adjustments"]),
      fitScore: 87,
      fitBreakdown: JSON.stringify({ skillMatch:34, titleSimilarity:20, seniorityAlignment:15, locationRemote:8, compensation:5, companySize:5, total:87, matchedSkills:["accounts receivable","sap","reconciliation","dispute resolution","billing","collections","gl adjustments"], explanation:["✅ 7 of 7 skills match your resume (AR, SAP, Reconciliation, Dispute Resolution, Billing, Collections, GL Adjustments)","✅ Your Colibri government client experience is directly relevant","✅ Salary range ($58k–$72k) is above your target — strong opportunity","⚠️ Security clearance preferred — not required, but worth noting in your application"] }),
      salaryMin: 58000, salaryMax: 72000,
      status: "new", priority: 1,
      createdAt: subDays(now, 4), updatedAt: subDays(now, 4),
    },
    {
      id: j10,
      title: "HR Operations Specialist",
      company: "Marriott International",
      location: "Lake Buena Vista, FL",
      remote: false,
      url: "https://jobs.marriott.com",
      rawJd: "Support HR operations including onboarding, offboarding, benefits administration support, and HRIS data entry. UKG or similar HRIS required. SHRM-CP preferred. 3+ years HR experience.",
      parsedSkills: JSON.stringify(["hr operations","onboarding","ukg","hris","shrm-cp","benefits","employee relations"]),
      fitScore: 76,
      fitBreakdown: JSON.stringify({ skillMatch:28, titleSimilarity:14, seniorityAlignment:15, locationRemote:8, compensation:6, companySize:5, total:76, matchedSkills:["hr operations","onboarding","ukg","shrm-cp","employee relations"], explanation:["✅ 5 of 7 skills match your resume (HR Operations, Onboarding, UKG, SHRM-CP, Employee Relations)","✅ Your SHRM-CP certification is a strong differentiator for this role","⚠️ This is your HR track resume — make sure to select 'HR Operations' resume when applying","⚠️ Salary not listed"] }),
      status: "new", priority: 0,
      createdAt: subDays(now, 2), updatedAt: subDays(now, 2),
    },
  ]).run();

  // ── Applications ─────────────────────────────────────────────────
  const a1 = createId(), a2 = createId(), a3 = createId();
  const a4 = createId(), a5 = createId(), a6 = createId();
  const a7 = createId();

  await db.insert(schema.applications).values([
    // Queued jobs — draft packets
    { id: a1, jobId: j1, resumeId: resumeIdAR, status: "draft", createdAt: now, updatedAt: now },
    { id: a2, jobId: j2, resumeId: resumeIdAR, status: "draft", createdAt: now, updatedAt: now },
    { id: a3, jobId: j7, resumeId: resumeIdAR, status: "draft", createdAt: now, updatedAt: now },
    // Applied — Watsco with full packet
    {
      id: a4, jobId: j4, resumeId: resumeIdAR, status: "submitted",
      coverLetter: `Dear Watsco Hiring Team,

I am writing to express my strong interest in the Accounts Receivable Specialist position. With over 10 years of B2B collections and AR management experience—including deep expertise in SAP and dispute resolution—I am confident I can contribute immediately to your finance team.

At Colibri Group, I managed 20–40 accounts daily using Salesforce and NetSuite, handling pricing variances, payment plans, and escalated balances. At Anheuser-Busch, I managed credit decisions on accounts up to $500K and built DSO reporting macros in SAP that reduced monthly close time. I am known for clear communication, consistent follow-through, and systematic aging management.

I am excited about the opportunity at Watsco and would welcome the chance to discuss how my background aligns with your team's needs.

Thank you for your consideration.

Best regards,
Jessica L. Herman`,
      tailoredResume: `• Managed 20–40 B2B accounts daily using Salesforce and NetSuite at Colibri Group; handled pricing variances, payment plans, and dispute escalation
• At Anheuser-Busch, managed credit decisions on accounts up to $500K using SAP; built DSO reporting macros that reduced monthly close time
• Maintained AR aging reports and performed systematic collections follow-up, consistently recovering past-due balances within target windows
• Processed cash receipts and reconciled GL adjustments across 125+ accounts weekly at Smurfit-Stone using SAP dispute documentation`,
      screeningQa: JSON.stringify([
        { question: "How many years of AR experience do you have?", answer: "10+ years managing full-cycle accounts receivable, including B2B collections, billing, dispute resolution, and cash application across manufacturing, beverage, and services industries." },
        { question: "Do you have SAP experience?", answer: "Yes — I used SAP extensively at Anheuser-Busch (credit analysis, DSO reporting, pricing macros) and Smurfit-Stone (dispute documentation, 125+ accounts/week)." },
        { question: "Are you comfortable with B2B collections calls?", answer: "Absolutely. I've handled collections calls throughout my career, including high-value accounts at Anheuser-Busch and consistent follow-up at Colibri Group." },
      ]),
      outreachMessage: `Hi [Recruiter Name],

I recently submitted my application for the AR Specialist position at Watsco and wanted to introduce myself directly. I have 10+ years of B2B AR experience with strong SAP expertise and a track record of resolving disputes and reducing DSO.

I'd be happy to connect if you have a few minutes to discuss the role.

Best regards,
Jessica Herman`,
      humanApprovedAt: subDays(now, 5),
      submittedAt: subDays(now, 5),
      createdAt: subDays(now, 5), updatedAt: subDays(now, 5),
    },
    // Other statuses for tracker variety
    {
      id: a5, jobId: j9, resumeId: resumeIdAR, status: "interviewing",
      coverLetter: "Cover letter for Lockheed Martin application.",
      submittedAt: subDays(now, 10), humanApprovedAt: subDays(now, 10),
      createdAt: subDays(now, 10), updatedAt: subDays(now, 3),
    },
    {
      id: a6, jobId: j6, resumeId: resumeIdAR, status: "rejected",
      submittedAt: subDays(now, 14), humanApprovedAt: subDays(now, 14),
      createdAt: subDays(now, 14), updatedAt: subDays(now, 7),
    },
    {
      id: a7, jobId: j5, resumeId: resumeIdAR, status: "ghosted",
      submittedAt: subDays(now, 21), humanApprovedAt: subDays(now, 21),
      createdAt: subDays(now, 21), updatedAt: subDays(now, 21),
    },
  ]).run();

  // ── Follow-ups ────────────────────────────────────────────────────
  await db.insert(schema.followUps).values([
    {
      id: createId(), applicationId: a4,
      dueDate: addDays(subDays(now, 5), 7),
      type: "week1", status: "pending",
      message: "Hi [Recruiter Name], I wanted to follow up on my AR Specialist application submitted last week. I remain very interested and would welcome the chance to discuss how my SAP and B2B collections experience fits your team's needs. Thank you!",
      createdAt: subDays(now, 5),
    },
    {
      id: createId(), applicationId: a5,
      dueDate: addDays(subDays(now, 10), 3),
      type: "thank_you", status: "sent",
      message: "Thank you so much for taking the time to interview me for the AR Specialist role at Lockheed Martin. I am very excited about the opportunity and look forward to hearing next steps.",
      createdAt: subDays(now, 7),
    },
  ]).run();

  console.log("✅ Turso DB seeded successfully.");
  console.log("   Resumes: 2 | Jobs: 10 | Applications: 7 | Follow-ups: 2");
  await client.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
