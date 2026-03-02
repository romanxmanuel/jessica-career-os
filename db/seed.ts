import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { createId } from "@paralleldrive/cuid2";
import path from "path";
import { addDays, subDays } from "date-fns";

const DB_PATH = path.join(process.cwd(), "career.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = OFF");
const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: path.join(process.cwd(), "db/migrations") });

// Clear all tables (children first)
db.delete(schema.followUps).run();
db.delete(schema.applications).run();
db.delete(schema.contacts).run();
db.delete(schema.dailySprints).run();
db.delete(schema.jobs).run();
db.delete(schema.resumeProfiles).run();
sqlite.pragma("foreign_keys = ON");

const now = new Date();

// ============================================================
// RESUME PROFILES — Jessica L. Herman's real resumes
// ============================================================
const resumeIdAR = createId();
const resumeIdHR = createId();

db.insert(schema.resumeProfiles).values([
  // ── PRIMARY: Accounts Receivable Specialist (95% of applications)
  {
    id: resumeIdAR,
    label: "Accounts Receivable Specialist",
    headline: "Accounts Receivable Specialist | 10+ Years | Salesforce · SAP · NetSuite | B2B Collections | Billing & Dispute Resolution",
    content: `JESSICA L. HERMAN
Orlando, FL | jessica.breakthrough@outlook.com | LinkedIn.com/in/jessicalherman

PROFESSIONAL SUMMARY
Accounts Receivable Specialist with 10+ years of experience managing billing, collections, and dispute resolution across corporate and education environments. Skilled in researching payment discrepancies, reconciling customer accounts, and sustaining steady cash flow. Experienced with Salesforce, NetSuite, and SAP to research invoices, payments, and account reconciliation. Known for clear customer communication, accurate documentation, and consistent follow-through.

CORE COMPETENCIES
Accounts Receivable • Customer Billing & Invoicing • B2B Collections • Account Reconciliation • Credit Holds & Credit Decisions • Aging Report Review & Follow-Up • Dispute Resolution & Short-Pay Research • Cash Application & Payment Posting • Refunds & GL Adjustments • Contract and Pricing Variance Investigation

TECHNICAL SKILLS
Salesforce • SAP • NetSuite • Excel (PivotTables, Lookups) • LMS/Student Platforms • Ticketing/Case Management

WORK EXPERIENCE

Colibri Group – Billing & Collections Specialist | 2021–2025
• Managed a daily queue of 20–40 learner and client accounts to resolve billing, payment, and access issues.
• Reviewed contracts and enrollments across multiple brands to support accurate invoicing and resolving disputes.
• Researched billing discrepancies across Salesforce and learning systems; coordinated credits and adjustments with Customer Service, IT, and Sales.
• Clarified invoices, policies, and payment options to students and B2B/government clients to reduce repeat inquiries.
• Set up and documented payment plans per guidelines to move delinquent accounts back into active payment status.
• Implemented a payment tool enabling real-time, auto-applied credit card payments, reducing Cash Application workload and improving AR integrity.
• Maintained detailed account notes and supported reporting for aging and collections tracking.

Smart Rentals – Leasing Representative | 2020–2021
• Guided tenants through the leasing journey, from tours to move-in, contributing to occupancy efficiency and satisfaction.
• Worked with management and maintenance teams to address tenant feedback and enhance property quality.

SKF Group – Accounts Receivable Specialist | 2019 (Greater St. Louis Area)
• Monitored accounts for assigned portfolios and prioritized follow-up on past-due invoices to avoid shipment holds.
• Researched short-pays and disputed charges; worked with Sales and Finance to resolve issues and collect outstanding balances.
• Trained new hires and colleagues on system processes to improve billing accuracy and deter rework.
• Reported weekly on high-priority accounts (over $20K) to the Credit Manager and Controller.
• Utilized Salesforce to track account statuses, escalating issues proactively to maintain smooth operations.

Anheuser-Busch – Senior Credit Analyst | 2011–2016 (St. Louis, MO)
• Reconciled high-volume branch payments against bank statements and general ledger to support timely and accurate month-end close.
• Approved credit limits and payment terms in line with sales risk guidelines to protect against bad debt.
• Analyzed accounts' finances and reported DSO metrics to leadership to highlight collection efforts.
• Standardized reporting workflows to improve processing efficiency and reduce delays.
• Served on lean six sigma projects: handled Monster Energy reimbursement claims and implemented a pricing macro for applying credits to invoices.
• Prepared month-end DSO reports and balanced daily control sheets against bank statements.

Smurfit-Stone – Collections Specialist | 2010–2011 (Creve Coeur, MO)
• Contacted over 125 business accounts weekly; generated aging spreadsheets to monitor payment progress and address overdue invoices.
• Investigated short-pay issues — billing, quality, or pricing discrepancies — collaborating with Regional Credit Managers and Sales to approve order releases.
• Used SAP to scan and attach dispute documents, resolving cash postings and deductions efficiently.

Star Manufacturing International (Division of The Middleby Corporation) – AR Analyst | 2007–2010 (Maplewood, MO)
• Reached out to customers to clarify payment details and support short-pay deductions.
• Posted checks, EFT transactions, and adjustments to accounts; composed policy change letters and past-due notices.

EDUCATION & CERTIFICATIONS
• M.A., Applied Communication Studies — Southern Illinois University Edwardsville (2016–2018)
• B.S., Psychology & Communication — Missouri State University (2007–2009)
• SHRM-CP — Certified July 2025
• Certificate in Conflict & Dispute Resolution`,
    skills: JSON.stringify([
      "Accounts Receivable",
      "B2B Collections",
      "Customer Billing & Invoicing",
      "Account Reconciliation",
      "Dispute Resolution",
      "Short-Pay Research",
      "Cash Application",
      "Payment Posting",
      "Credit Holds",
      "Credit Decisions",
      "AR Aging Reports",
      "GL Adjustments",
      "Salesforce",
      "SAP",
      "NetSuite",
      "Excel",
      "PivotTables",
      "VLOOKUP",
      "Pricing Variance Investigation",
      "DSO Reporting",
      "Month-End Close",
      "Payment Plans",
      "Collections Follow-Up",
    ]),
    yearsExperience: 10,
    targetRoleLevel: "mid",
    isDefault: true,
    createdAt: now,
  },

  // ── SECONDARY: HR Operations (5% of applications — SHRM-CP leverage)
  {
    id: resumeIdHR,
    label: "HR Operations Specialist",
    headline: "HR Operations & People Support | SHRM-CP | Training & Onboarding | Conflict Resolution | Process Improvement",
    content: `JESSICA L. HERMAN
Orlando, FL | jessica.breakthrough@outlook.com | LinkedIn.com/in/jessicalherman

PROFESSIONAL SUMMARY
Adaptable and resourceful people-focused professional with experience leading training, onboarding, employee and learner communication, and process improvements across corporate, academic, and nonprofit environments. Known for sharing knowledge and helping individuals navigate policies and procedures with confidence. Earned SHRM-CP certification in July 2025, strengthening adult learning, real-world HR, and people operations expertise.

CORE SKILLS
Training & Onboarding Support • Employee & Learner Experience • People Operations • HR Support & Policy Communication • Conflict Resolution • Workflow Optimization • Process Improvement • Cross-Functional Collaboration

TECHNICAL SKILLS
Salesforce • SAP • NetSuite • UKG • Gusto • Excel (PivotTables, Lookups)

WORK EXPERIENCE

Colibri Group – Student Access & B2B Collections | 2021–2025
• Handled and resolved enrollment and account issues to restore learner access and ensure a positive student experience.
• Maintained detailed documentation to support decision-making and smoother workflows across departments.
• Explained policies and next steps to students and clients, directly reducing confusion and repeat inquiries.
• Identified pain points in multi-system workflows and proposed solutions to enhance efficiency and satisfaction.
• Collaborated with Customer Service, IT, and Sales teams to resolve billing discrepancies.

Junior League of St. Louis – Training & Member Communications | 2018–2022
• New Member Advisor (2021–2022): Facilitated onboarding meetings and events to engage and orient incoming members.
• Training Director (2019–2021): Designed and executed high-impact learning events featuring guest speakers and team skill-building workshops.
• Communication Coordinator (2019–2020): Designed newsletters and managed social media presence to promote events and communicate internal updates.
• DEI Liaison (2018–2020): Advocated for inclusive practices and aligned member engagement strategies with organizational values.

SKF Group – Accounts Receivable Specialist | 2019
• Trained new hires on internal tools and processes to support cross-team efficiency.
• Regularly provided updates to leadership on accounts, bottlenecks, and order exceptions.

Southern Illinois University Edwardsville – Teaching Assistant | 2017–2018
• Coached 115+ students in communication courses and presentation skills.
• Provided timely, structured feedback to strengthen skill development.
• Met with faculty and TAs to improve course delivery and student engagement.

Anheuser-Busch – Senior Accounting Analyst | 2011–2016
• Reduced operational delays through standardizing processes and consistent follow-through.
• Documented SOPs and audit materials to ensure team readiness and compliance.
• Created tools and process maps that optimized project accuracy and team performance.

EDUCATION & CERTIFICATIONS
• M.A., Applied Communication Studies — Southern Illinois University Edwardsville (2016–2018)
• B.S., Psychology & Communication — Missouri State University (2007–2009)
• SHRM-CP — Certified July 2025
• Certificate in Conflict & Dispute Resolution`,
    skills: JSON.stringify([
      "SHRM-CP",
      "Training & Onboarding",
      "People Operations",
      "HR Support",
      "Policy Communication",
      "Conflict Resolution",
      "Workflow Optimization",
      "Process Improvement",
      "Cross-Functional Collaboration",
      "Employee Experience",
      "SOPs",
      "UKG",
      "Gusto",
      "Salesforce",
      "SAP",
      "NetSuite",
      "Excel",
      "DEI",
      "Adult Learning",
    ]),
    yearsExperience: 10,
    targetRoleLevel: "mid",
    isDefault: false,
    createdAt: now,
  },
]).run();

// ============================================================
// JOBS — Realistic roles for Greater Orlando area
// AR roles match Jessica's actual skills: Salesforce, SAP, NetSuite, B2B collections, billing disputes
// HR roles match SHRM-CP + communication background (5%)
// ============================================================
const jobIds = Array.from({ length: 10 }, () => createId());

const JOB_DATA = [
  // ── JOB 1: Strong AR fit — tech company using Salesforce/NetSuite (her exact stack)
  {
    id: jobIds[0],
    title: "Accounts Receivable Specialist",
    company: "Darden Restaurants",
    location: "Lake Mary, FL",
    jobType: "full-time",
    remote: false,
    url: "https://careers.darden.com",
    rawJd: `Darden Restaurants Corporate Finance team is hiring an AR Specialist to manage our corporate receivables portfolio.

Responsibilities:
• Manage daily AR portfolio for 30–50 corporate accounts — posting payments, investigating short-pays, and resolving billing disputes
• Research pricing and contract variances across Oracle and Salesforce to ensure invoice accuracy
• Follow up on past-due balances via phone and email; document all collection activity
• Prepare AR aging reports weekly for Controller and Finance leadership
• Reconcile AR sub-ledger to general ledger; support month-end close
• Coordinate with Sales and Operations to resolve customer billing questions
• Set up payment plans for accounts in arrears per company guidelines

Requirements:
• 3+ years accounts receivable or billing experience in a corporate environment
• Salesforce or NetSuite experience required
• Excel proficiency — PivotTables, VLOOKUPs
• Strong communication skills for resolving payment disputes
• Attention to detail, accurate documentation
• Associate's or Bachelor's degree in Accounting, Business, or related field preferred`,
    fitScore: 95,
    fitBreakdown: JSON.stringify({
      skillMatch: 40,
      titleSimilarity: 20,
      seniorityAlignment: 15,
      locationRemote: 10,
      compensation: 5,
      companySize: 5,
      total: 95,
    }),
    parsedSkills: JSON.stringify([
      "Accounts Receivable",
      "Salesforce",
      "NetSuite",
      "Excel",
      "PivotTables",
      "VLOOKUP",
      "Short-Pay Research",
      "Billing Disputes",
      "AR Aging Reports",
      "Month-End Close",
      "Payment Plans",
      "Collections",
    ]),
    status: "queued",
    priority: 1,
    salaryMin: 48000,
    salaryMax: 58000,
    notes: "Near-perfect fit. Salesforce + NetSuite match her exact stack. Lake Mary is an easy commute.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 2: AR role at health system — good fit, some new territory
  {
    id: jobIds[1],
    title: "Billing & Collections Specialist",
    company: "AdventHealth",
    location: "Lake Nona, FL",
    jobType: "full-time",
    remote: false,
    url: "https://jobs.adventhealth.com",
    rawJd: `AdventHealth Lake Nona Revenue Cycle team is looking for a Billing & Collections Specialist.

Job Summary:
Manage a portfolio of corporate and self-pay accounts; resolve billing discrepancies; follow up on past-due balances; post payments and adjustments; prepare aging reports.

Key Responsibilities:
• Manage 20–40 B2B and patient accounts daily — resolve billing, access, and payment issues
• Investigate billing discrepancies and coordinate credits/adjustments with internal departments
• Document payment plans and account notes in compliance with financial controls
• Follow up on overdue accounts by phone and email; escalate as needed
• Support monthly reporting for AR aging and collections status

Requirements:
• 2+ years billing, collections, or AR experience
• Experience with Salesforce, NetSuite, or similar CRM/ERP preferred
• Excel skills (PivotTables, Lookups)
• Strong verbal and written communication
• High school diploma required; Associate's in Business/Accounting preferred`,
    fitScore: 92,
    fitBreakdown: JSON.stringify({
      skillMatch: 38,
      titleSimilarity: 18,
      seniorityAlignment: 15,
      locationRemote: 10,
      compensation: 6,
      companySize: 5,
      total: 92,
    }),
    parsedSkills: JSON.stringify([
      "Billing",
      "Collections",
      "Accounts Receivable",
      "Salesforce",
      "NetSuite",
      "Excel",
      "Payment Plans",
      "AR Aging Reports",
      "Dispute Resolution",
    ]),
    status: "queued",
    priority: 1,
    salaryMin: 42000,
    salaryMax: 52000,
    notes: "Very strong fit. Job title mirrors her exact Colibri Group role. Lake Nona is close.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 3: AR role at manufacturing/distribution — matches SKF + Smurfit background
  {
    id: jobIds[2],
    title: "Accounts Receivable Specialist",
    company: "Watsco Inc.",
    location: "Orlando, FL",
    jobType: "full-time",
    remote: false,
    url: "https://www.watsco.com/careers",
    rawJd: `Watsco, North America's largest HVAC distributor, is hiring an AR Specialist for our Orlando operations.

What You'll Do:
• Monitor distributor and dealer accounts for past-due balances; prioritize follow-up on high-value accounts
• Investigate short-pays and disputed invoices; coordinate with Sales and Finance to resolve and release orders
• Post payments — checks, EFTs, credit card transactions — to accounts accurately
• Generate and review AR aging reports weekly; report at-risk accounts to Credit Manager
• Approve or place credit holds per company guidelines; communicate decisions to Sales team
• Support month-end reconciliation and GL close

What We're Looking For:
• 3+ years AR, collections, or credit analyst experience in distribution, manufacturing, or wholesale
• SAP or NetSuite experience required
• Excel proficiency
• Experience reporting to Credit Manager or Controller on at-risk accounts
• Strong organizational skills and high attention to detail`,
    fitScore: 90,
    fitBreakdown: JSON.stringify({
      skillMatch: 37,
      titleSimilarity: 19,
      seniorityAlignment: 15,
      locationRemote: 9,
      compensation: 5,
      companySize: 5,
      total: 90,
    }),
    parsedSkills: JSON.stringify([
      "Accounts Receivable",
      "SAP",
      "NetSuite",
      "Credit Holds",
      "Credit Decisions",
      "Short-Pay Research",
      "Collections",
      "AR Aging Reports",
      "Month-End Close",
      "Excel",
    ]),
    status: "queued",
    priority: 1,
    salaryMin: 46000,
    salaryMax: 56000,
    notes: "Excellent fit — distribution/manufacturing matches SKF and Smurfit history. SAP is on her resume.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 4: Being applied to right now — already has packet
  {
    id: jobIds[3],
    title: "AR Coordinator",
    company: "Siemens Energy",
    location: "Lake Mary, FL",
    jobType: "full-time",
    remote: false,
    url: "https://careers.siemens-energy.com",
    rawJd: `Siemens Energy is hiring an AR Coordinator for our Lake Mary, FL office.

Responsibilities:
• Manage accounts receivable for assigned customer portfolio; resolve billing disputes and short-pays
• Apply cash receipts daily; reconcile unapplied cash in SAP
• Investigate pricing variances and contract discrepancies; coordinate corrections with Sales
• Prepare weekly aging summaries and present escalated accounts to Finance management
• Process refunds, GL adjustments, and credit memos per approval workflow
• Collaborate cross-functionally with Customer Service, Sales, and Finance

Requirements:
• 3+ years AR experience, preferably in corporate or industrial environment
• SAP required; Salesforce a plus
• Excel proficiency (PivotTables, VLOOKUPs)
• Strong analytical and communication skills
• Associate's or Bachelor's degree in Accounting, Finance, or Business`,
    fitScore: 88,
    fitBreakdown: JSON.stringify({
      skillMatch: 36,
      titleSimilarity: 16,
      seniorityAlignment: 14,
      locationRemote: 10,
      compensation: 7,
      companySize: 5,
      total: 88,
    }),
    parsedSkills: JSON.stringify([
      "Accounts Receivable",
      "SAP",
      "Salesforce",
      "Cash Application",
      "GL Adjustments",
      "Pricing Variance",
      "AR Aging",
      "Excel",
      "PivotTables",
      "Dispute Resolution",
    ]),
    status: "applying",
    priority: 1,
    salaryMin: 50000,
    salaryMax: 62000,
    notes: "SAP + Salesforce — direct match to her toolkit. Industrial fits SKF experience.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 5: Remote/hybrid AR — good stretch for work-life balance
  {
    id: jobIds[4],
    title: "Accounts Receivable Specialist — Remote",
    company: "Chewy",
    location: "Plantation, FL (Remote eligible)",
    jobType: "full-time",
    remote: true,
    url: "https://careers.chewy.com",
    rawJd: `Chewy Finance team is looking for an AR Specialist to join our remote-friendly team.

You'll be responsible for:
• Managing B2B vendor and marketplace receivables — payment follow-up, dispute resolution, and reconciliation
• Working in NetSuite to post payments, process adjustments, and investigate discrepancies
• Researching contract and pricing variances; collaborating with Vendor Relations and Finance
• Running weekly aging reports and presenting status updates to AR leadership
• Setting up payment plans for past-due accounts; documenting all activity per policy

What you bring:
• 2+ years AR or collections experience in a corporate or e-commerce environment
• NetSuite required; Salesforce experience a plus
• Intermediate Excel skills
• Comfortable working independently in a remote environment
• Detail-oriented with strong written communication`,
    fitScore: 82,
    fitBreakdown: JSON.stringify({
      skillMatch: 34,
      titleSimilarity: 19,
      seniorityAlignment: 14,
      locationRemote: 10,
      compensation: 5,
      companySize: 0,
      total: 82,
    }),
    parsedSkills: JSON.stringify([
      "Accounts Receivable",
      "NetSuite",
      "Salesforce",
      "B2B Collections",
      "Dispute Resolution",
      "Payment Plans",
      "AR Aging",
      "Excel",
      "Remote Work",
    ]),
    status: "queued",
    priority: 0,
    salaryMin: 44000,
    salaryMax: 54000,
    notes: "Good remote option. NetSuite is her tool. E-commerce is new but AR skills transfer.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 6: HR Operations — SHRM-CP leverage (5% track)
  {
    id: jobIds[5],
    title: "HR Operations Coordinator",
    company: "Marriott International",
    location: "Lake Buena Vista, FL",
    jobType: "full-time",
    remote: false,
    url: "https://jobs.marriott.com",
    rawJd: `Marriott International is seeking an HR Operations Coordinator to support our Central Florida HR team.

Key Responsibilities:
• Support onboarding and offboarding workflows for hotel properties in the Orlando area
• Coordinate new hire documentation, background checks, and benefits enrollment
• Respond to associate inquiries regarding HR policies, payroll, and benefits
• Maintain accurate employee records in UKG (Kronos) HRIS system
• Assist with training coordination and tracking completion in LMS
• Draft HR communications, policy updates, and process documentation
• Support compliance reporting and audit documentation

Requirements:
• 2+ years experience in HR, people operations, or administrative support
• SHRM-CP or PHR preferred
• UKG, Gusto, or similar HRIS experience a plus
• Strong written and verbal communication
• Conflict resolution skills an asset
• Bachelor's or Master's degree in HR, Business, or related field preferred`,
    fitScore: 78,
    fitBreakdown: JSON.stringify({
      skillMatch: 32,
      titleSimilarity: 14,
      seniorityAlignment: 14,
      locationRemote: 8,
      compensation: 5,
      companySize: 5,
      total: 78,
    }),
    parsedSkills: JSON.stringify([
      "HR Operations",
      "Onboarding",
      "UKG",
      "HRIS",
      "SHRM-CP",
      "Training Coordination",
      "Policy Communication",
      "LMS",
      "Conflict Resolution",
      "Process Documentation",
    ]),
    status: "queued",
    priority: 0,
    salaryMin: 45000,
    salaryMax: 55000,
    notes: "Use the HR Operations resume. SHRM-CP + UKG + conflict resolution cert make this a solid match.",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 7: Already submitted — shows in pipeline
  {
    id: jobIds[6],
    title: "Accounts Receivable Specialist",
    company: "Tavistock Development Company",
    location: "Lake Nona, FL",
    jobType: "full-time",
    remote: false,
    url: "https://tavistock.com/careers",
    rawJd: `Tavistock Development is hiring an AR Specialist to manage tenant and partner receivables for our Lake Nona master-planned community portfolio.

Duties:
• Post monthly charges and follow up on delinquent accounts
• Research and resolve billing discrepancies; communicate with tenants and partners
• Prepare delinquency and aging reports for property management leadership
• Process adjustments, refunds, and reconciliations in NetSuite
• Assist with annual reconciliations and audit documentation

Qualifications:
• 2+ years AR or billing experience
• NetSuite or QuickBooks experience preferred
• Excel proficiency required
• Professional communication skills
• Detail-oriented with strong follow-through`,
    fitScore: 80,
    fitBreakdown: JSON.stringify({
      skillMatch: 32,
      titleSimilarity: 19,
      seniorityAlignment: 14,
      locationRemote: 9,
      compensation: 4,
      companySize: 2,
      total: 80,
    }),
    parsedSkills: JSON.stringify([
      "Accounts Receivable",
      "NetSuite",
      "Billing",
      "AR Aging",
      "Reconciliation",
      "Excel",
      "Collections",
    ]),
    status: "applied",
    priority: 0,
    salaryMin: 42000,
    salaryMax: 50000,
    notes: "Applied 2 weeks ago. Local Lake Nona company — short commute. Follow up this week.",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 9: Credit & Collections at insurance company — good stretch fit
  {
    id: jobIds[8],
    title: "Credit & Collections Analyst",
    company: "Brown & Brown Insurance",
    location: "Daytona Beach, FL",
    jobType: "full-time",
    remote: false,
    url: "https://bbinsurance.com/careers",
    rawJd: `Brown & Brown Insurance is seeking a Credit & Collections Analyst for our Corporate Finance team.

Responsibilities:
• Manage premium finance receivables — follow up on past-due accounts, process payments, issue demand letters
• Research and resolve billing disputes with agents, clients, and carriers
• Prepare weekly delinquency and aging reports for CFO and Controller
• Approve credit holds and initiate cancellation processes per company guidelines
• Use Salesforce to track account activity and document all collection communications
• Coordinate with Underwriting and Operations to resolve billing discrepancies

Requirements:
• 2+ years credit, collections, or AR experience
• Salesforce or similar CRM required
• Excel proficiency
• Strong analytical and negotiation skills
• Associate's or Bachelor's in Finance, Accounting, or Business preferred`,
    fitScore: 75,
    fitBreakdown: JSON.stringify({
      skillMatch: 30,
      titleSimilarity: 14,
      seniorityAlignment: 14,
      locationRemote: 7,
      compensation: 5,
      companySize: 5,
      total: 75,
    }),
    parsedSkills: JSON.stringify([
      "Collections",
      "Credit",
      "Accounts Receivable",
      "Salesforce",
      "Dispute Resolution",
      "AR Aging Reports",
      "Credit Holds",
      "Excel",
    ]),
    status: "new",
    priority: 0,
    salaryMin: 45000,
    salaryMax: 58000,
    notes: "Daytona Beach is a stretch commute — hybrid/remote possibility? Salesforce is a match.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 10: AR at construction/real estate company — Florida market
  {
    id: jobIds[9],
    title: "Accounts Receivable Coordinator",
    company: "Wharton-Smith Construction",
    location: "Sanford, FL",
    jobType: "full-time",
    remote: false,
    url: "https://wharton-smith.com/careers",
    rawJd: `Wharton-Smith, a top Florida construction company, seeks an AR Coordinator for our Sanford office.

What You'll Do:
• Process progress billings and manage subcontractor and owner receivables
• Follow up on past-due AIA billing cycles; resolve payment disputes with project owners
• Reconcile job cost accounts and post payments in Sage accounting software
• Prepare monthly AR aging and present to the CFO
• Coordinate with Project Managers to resolve billing holdbacks and lien waiver requests
• Issue lien waivers and track conditional/unconditional lien releases

Requirements:
• 2+ years AR or job-cost billing experience in construction, real estate, or property management
• Sage 300 or similar construction accounting software preferred
• Excel required
• Understanding of AIA billing process a plus
• Detail-oriented with professional communication skills`,
    fitScore: 65,
    fitBreakdown: JSON.stringify({
      skillMatch: 24,
      titleSimilarity: 16,
      seniorityAlignment: 13,
      locationRemote: 9,
      compensation: 3,
      companySize: 0,
      total: 65,
    }),
    parsedSkills: JSON.stringify([
      "Accounts Receivable",
      "Billing",
      "Reconciliation",
      "AR Aging",
      "Excel",
      "Collections",
      "Lien Waivers",
    ]),
    status: "new",
    priority: 0,
    salaryMin: 38000,
    salaryMax: 48000,
    notes: "Construction billing is a stretch — AIA billing and lien waivers are new. Sanford is commutable.",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },

  // ── JOB 8: Interviewing — shows movement in pipeline
  {
    id: jobIds[7],
    title: "Senior AR Analyst",
    company: "Lockheed Martin",
    location: "Lake Mary, FL",
    jobType: "full-time",
    remote: false,
    url: "https://www.lockheedmartin.com/careers",
    rawJd: `Lockheed Martin Finance is seeking a Senior AR Analyst at our Lake Mary, FL campus.

Responsibilities:
• Analyze and resolve complex AR discrepancies on commercial and government contracts
• Prepare AR aging analysis and present findings to Finance leadership
• Reconcile AR to SAP general ledger; research unapplied cash
• Coordinate billing and collections for high-value accounts
• Support DCAA audit documentation requests

Requirements:
• 4+ years AR or collections experience in a corporate environment
• SAP required
• Advanced Excel skills
• Strong analytical and communication skills
• Bachelor's degree preferred`,
    fitScore: 72,
    fitBreakdown: JSON.stringify({
      skillMatch: 28,
      titleSimilarity: 15,
      seniorityAlignment: 13,
      locationRemote: 9,
      compensation: 5,
      companySize: 2,
      total: 72,
    }),
    parsedSkills: JSON.stringify([
      "Accounts Receivable",
      "SAP",
      "Excel",
      "AR Aging Analysis",
      "Collections",
      "Reconciliation",
      "Dispute Resolution",
    ]),
    status: "applied",
    priority: 0,
    salaryMin: 55000,
    salaryMax: 70000,
    notes: "Stretch role — government contracts billing is specialized. But SAP matches perfectly. In interview process!",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },
];

for (const job of JOB_DATA) {
  db.insert(schema.jobs).values(job).run();
}

// ============================================================
// APPLICATIONS
// ============================================================
const appId1 = createId(); // Siemens — human_review (packet generated, needs approval)
const appId2 = createId(); // AdventHealth — submitted (applied 5 days ago)
const appId3 = createId(); // Tavistock — submitted (applied 2 weeks ago)
const appId4 = createId(); // Lockheed — interviewing

db.insert(schema.applications).values([
  {
    id: appId1,
    jobId: jobIds[3], // Siemens Energy
    resumeId: resumeIdAR,
    status: "human_review",
    coverLetter: `Dear Siemens Energy Hiring Team,

I'm excited to apply for the AR Coordinator role at your Lake Mary office. With 10+ years of accounts receivable and billing experience — including hands-on work in SAP, Salesforce, and NetSuite — I'm confident I can step in and contribute immediately.

In my most recent role at Colibri Group, I managed 20–40 accounts daily, investigated pricing and contract variances across Salesforce and internal systems, and coordinated credit adjustments with Sales, IT, and Customer Service to resolve disputes and accelerate cash flow. Prior to that, at SKF Group, I reported weekly on high-priority accounts (over $20K) to the Credit Manager and Controller — directly mirroring the AR reporting structure you've described.

I'm local to the Orlando/Lake Mary area and available to start immediately. I would welcome the chance to discuss how my background aligns with your team's needs.

Sincerely,
Jessica L. Herman`,
    tailoredResume: `Key bullets tailored for Siemens Energy AR Coordinator:\n• Managed 20–40 B2B and client accounts daily in Salesforce — resolved billing discrepancies, disputes, and pricing variances\n• Researched contract and pricing variances across Salesforce and internal systems; coordinated credits and adjustments with Sales, IT, and Customer Service\n• Set up and documented payment plans per guidelines to move delinquent accounts back into active payment status\n• Reported weekly on high-priority accounts (over $20K) to Credit Manager and Controller at SKF Group\n• Used SAP to scan and attach dispute documents, resolving cash postings and deductions at Smurfit-Stone`,
    screeningQa: JSON.stringify([
      {
        question: "Tell me about yourself.",
        answer: "I'm an AR Specialist with 10+ years of experience managing billing, collections, and dispute resolution in corporate environments. My most recent role was at Colibri Group, where I managed 20–40 accounts daily and used Salesforce and NetSuite to investigate discrepancies and drive collections. I also have SAP experience from earlier roles at SKF Group and Smurfit-Stone. I'm currently based in the Orlando area and am looking for my next opportunity to bring that experience to a strong team.",
      },
      {
        question: "Why do you want to work at Siemens Energy?",
        answer: "Siemens Energy has a strong reputation for operational excellence, and I'm drawn to the scale and complexity of managing AR in an industrial/energy environment. My background at SKF Group — a manufacturing and industrial company — showed me that I thrive in structured corporate AR environments where accuracy and cross-functional communication are critical. I'm excited to bring that experience to your Finance team.",
      },
      {
        question: "Describe your experience with SAP.",
        answer: "I used SAP extensively at Smurfit-Stone, where I scanned and attached dispute documents and resolved cash postings and deductions. At Anheuser-Busch, I used SAP to reconcile high-volume branch payments to bank statements and the GL to support timely month-end close. I'm comfortable navigating SAP for AR transactions, cash application, and reporting.",
      },
      {
        question: "How do you handle a customer disputing an invoice?",
        answer: "My process starts with listening carefully to understand exactly what they're disputing — whether it's pricing, quantity, or a contract variance. I then research the invoice against the contract or order in the system and gather any relevant documentation. If it's a legitimate dispute, I coordinate the credit or adjustment with Sales and Finance per approval guidelines and communicate the resolution clearly to the customer. I document every step in the system to prevent repeat issues and support any audit needs.",
      },
    ]),
    outreachMessage: `Hi [Name], I recently applied for the AR Coordinator role at Siemens Energy in Lake Mary and wanted to introduce myself. I have 10+ years of AR experience including SAP and Salesforce, and my background at SKF Group in a similar industrial environment feels like a strong match. Would love to connect if you have a few minutes. Thank you!`,
    humanApprovedAt: null,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: appId2,
    jobId: jobIds[1], // AdventHealth
    resumeId: resumeIdAR,
    status: "submitted",
    coverLetter: `Dear AdventHealth Hiring Team,

I'm applying for the Billing & Collections Specialist role. My experience at Colibri Group — managing 20–40 accounts daily, resolving billing discrepancies, setting up payment plans, and coordinating with multiple departments — directly mirrors what you're looking for.

I'm local to the Orlando area and excited about the opportunity to join AdventHealth.

Best,
Jessica L. Herman`,
    tailoredResume: null,
    screeningQa: null,
    outreachMessage: null,
    humanApprovedAt: subDays(now, 5),
    submittedAt: subDays(now, 5),
    createdAt: subDays(now, 6),
    updatedAt: subDays(now, 5),
  },
  {
    id: appId3,
    jobId: jobIds[6], // Tavistock
    resumeId: resumeIdAR,
    status: "submitted",
    coverLetter: `Dear Tavistock Development Team,

I'm interested in the AR Specialist role. My background managing high-volume receivables and resolving billing discrepancies — most recently at Colibri Group with NetSuite and Salesforce — transfers well to your property receivables environment.

I'm local to the Lake Nona area and look forward to hearing from you.

Best,
Jessica L. Herman`,
    tailoredResume: null,
    screeningQa: null,
    outreachMessage: null,
    humanApprovedAt: subDays(now, 12),
    submittedAt: subDays(now, 12),
    createdAt: subDays(now, 14),
    updatedAt: subDays(now, 12),
  },
  {
    id: appId4,
    jobId: jobIds[7], // Lockheed Martin
    resumeId: resumeIdAR,
    status: "interviewing",
    coverLetter: `Dear Lockheed Martin Recruiting,

I'm applying for the Senior AR Analyst position at your Lake Mary campus. My 10+ years of AR experience — including SAP at Smurfit-Stone and Anheuser-Busch, and senior-level reporting to Credit Managers and Controllers — positions me well for this role.

I'm local to the area and available to interview at your convenience.

Best,
Jessica L. Herman`,
    tailoredResume: null,
    screeningQa: null,
    outreachMessage: null,
    humanApprovedAt: subDays(now, 18),
    submittedAt: subDays(now, 18),
    createdAt: subDays(now, 20),
    updatedAt: subDays(now, 3),
  },
]).run();

// ── Additional applications to populate a realistic pipeline ─────────────────
const extraApps = [
  // Darden — draft (packet not generated yet)
  { jobId: jobIds[0], status: "draft", daysAgoCreated: 1, daysAgoUpdated: 1 },
  // Watsco — human_review (packet generated, pending her review)
  { jobId: jobIds[2], status: "human_review", daysAgoCreated: 3, daysAgoUpdated: 1 },
  // Chewy — submitted 3 days ago
  { jobId: jobIds[4], status: "submitted", daysAgoCreated: 5, daysAgoUpdated: 3, submittedDaysAgo: 3 },
  // Marriott HR — submitted 8 days ago
  { jobId: jobIds[5], status: "submitted", daysAgoCreated: 10, daysAgoUpdated: 8, submittedDaysAgo: 8 },
  // Brown & Brown — submitted 10 days ago, no reply = ghosted
  { jobId: jobIds[8], status: "ghosted", daysAgoCreated: 12, daysAgoUpdated: 10, submittedDaysAgo: 10 },
  // Wharton-Smith — rejected 5 days ago
  { jobId: jobIds[9], status: "rejected", daysAgoCreated: 15, daysAgoUpdated: 5 },
  // Darden (2nd attempt, different date) — submitted 15 days ago
  { jobId: jobIds[0], status: "submitted", daysAgoCreated: 17, daysAgoUpdated: 15, submittedDaysAgo: 15 },
  // AdventHealth (2nd app, older) — rejected
  { jobId: jobIds[1], status: "rejected", daysAgoCreated: 20, daysAgoUpdated: 18 },
  // Watsco (2nd app, older) — ghosted
  { jobId: jobIds[2], status: "ghosted", daysAgoCreated: 22, daysAgoUpdated: 20, submittedDaysAgo: 20 },
];

for (const ea of extraApps) {
  const appId = createId();
  const createdDate = subDays(now, ea.daysAgoCreated);
  const updatedDate = subDays(now, ea.daysAgoUpdated);
  const submittedDate = "submittedDaysAgo" in ea && ea.submittedDaysAgo ? subDays(now, ea.submittedDaysAgo) : null;

  db.insert(schema.applications).values({
    id: appId,
    jobId: ea.jobId,
    resumeId: resumeIdAR,
    status: ea.status,
    coverLetter: ea.status !== "draft" ? "Cover letter submitted with application." : null,
    tailoredResume: null,
    screeningQa: null,
    outreachMessage: null,
    humanApprovedAt: submittedDate,
    submittedAt: submittedDate,
    createdAt: createdDate,
    updatedAt: updatedDate,
  }).run();

  // Add follow-up for submitted apps
  if (submittedDate && (ea.status === "submitted" || ea.status === "ghosted")) {
    db.insert(schema.followUps).values({
      id: createId(),
      applicationId: appId,
      dueDate: addDays(submittedDate, 7),
      type: "week1",
      status: addDays(submittedDate, 7) < now ? "pending" : "pending",
      createdAt: submittedDate,
    }).run();
  }
}

// ============================================================
// FOLLOW-UPS
// ============================================================
db.insert(schema.followUps).values([
  {
    id: createId(),
    applicationId: appId2, // AdventHealth — submitted 5 days ago, follow up now
    dueDate: now,
    type: "week1",
    status: "pending",
    message: `Hi, my name is Jessica Herman and I'm following up on my application for the Billing & Collections Specialist role at AdventHealth Lake Nona. I applied about a week ago and remain very interested in joining your team. Please let me know if you need any additional information. Thank you for your time!`,
    createdAt: subDays(now, 5),
  },
  {
    id: createId(),
    applicationId: appId3, // Tavistock — overdue by 2 days
    dueDate: subDays(now, 2),
    type: "week1",
    status: "pending",
    message: `Hi, this is Jessica Herman. I'm following up on my application for the AR Specialist role at Tavistock Development, submitted about 2 weeks ago. I'm very interested in this opportunity and would love to connect. Thank you for your consideration!`,
    createdAt: subDays(now, 12),
  },
  {
    id: createId(),
    applicationId: appId4, // Lockheed — interviewing, thank you note due tomorrow
    dueDate: addDays(now, 1),
    type: "thank_you",
    status: "pending",
    message: `Dear [Interviewer Name], Thank you so much for taking the time to speak with me today about the Senior AR Analyst role at Lockheed Martin. I really enjoyed learning about your Finance team's work and the scope of accounts you manage. I'm genuinely excited about this opportunity, and I believe my SAP experience and background managing high-priority AR portfolios would allow me to contribute quickly. Please don't hesitate to reach out if you need any additional information. I look forward to hearing from you!`,
    createdAt: subDays(now, 3),
  },
  {
    id: createId(),
    applicationId: appId2, // AdventHealth — week 2 in the future
    dueDate: addDays(now, 7),
    type: "week2",
    status: "pending",
    message: `Hi, this is Jessica Herman again following up on my Billing & Collections Specialist application at AdventHealth Lake Nona. I remain very interested and am happy to provide references or any additional information. Thank you!`,
    createdAt: now,
  },
]).run();

// ============================================================
// DAILY SPRINT
// ============================================================
const today = new Date().toISOString().split("T")[0];
db.insert(schema.dailySprints)
  .values({
    id: createId(),
    date: today,
    goalCount: 5,
    completedCount: 1,
    notes: "Priority: Review Siemens packet, follow up on Tavistock (overdue), apply to Darden and Watsco.",
    createdAt: now,
  })
  .run();

console.log("✅ Seed complete — Jessica L. Herman's real data loaded.");
sqlite.close();
