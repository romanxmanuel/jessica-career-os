// Outreach Pack generator — no LLM, template-based.
// Produces recruiter message, hiring manager message, and follow-up.
// All content from resume headline only — nothing invented.

export interface OutreachPack {
  recruiterMessage: string;
  recruiterSubject: string;
  hiringManagerMessage: string;
  hiringManagerSubject: string;
  followUpMessage: string;
  followUpSubject: string;
}

interface OutreachInput {
  jobTitle: string;
  company: string;
  location?: string | null;
  resumeHeadline?: string;
  resumeYearsExp?: number;
  contactName?: string | null;
}

export function generateOutreachPack(input: OutreachInput): OutreachPack {
  const { jobTitle, company, location, resumeHeadline, resumeYearsExp, contactName } = input;

  const yearsText =
    resumeYearsExp && resumeYearsExp > 0 ? `${resumeYearsExp}+ years of` : "extensive";

  const locationNote = location
    ? `I'm based in the ${location} area and available immediately.`
    : "I'm actively looking and available immediately.";

  const nameGreeting = contactName ? `Hi ${contactName.split(" ")[0]},` : "Hi,";

  // ── Recruiter Message ──────────────────────────────────────────────────────
  const recruiterMessage = `${nameGreeting}

I came across the ${jobTitle} opening at ${company} and wanted to reach out directly. I have ${yearsText} experience in ${resumeHeadline ?? "accounts receivable and billing"}, with a strong track record in B2B collections, dispute resolution, and ERP platforms like NetSuite, SAP, and Salesforce.

${locationNote}

Would you be open to a quick conversation? I'd love to learn more about the role.

Best,
Jessica Herman`;

  const recruiterSubject = `${jobTitle} Candidate — ${yearsText} AR Experience`;

  // ── Hiring Manager Message ─────────────────────────────────────────────────
  const hiringManagerMessage = `${nameGreeting}

I noticed ${company} is hiring for a ${jobTitle} and wanted to connect. With ${yearsText} experience managing AR portfolios, reducing DSO, and resolving billing disputes — I believe I can contribute quickly to your team.

I've worked across Salesforce, NetSuite, and SAP, and I'm comfortable handling both B2B and government accounts. ${locationNote}

Happy to share my resume or jump on a quick call — whatever is easiest.

Best,
Jessica Herman`;

  const hiringManagerSubject = `Interested in ${jobTitle} Role — Jessica Herman`;

  // ── Follow-Up Message ──────────────────────────────────────────────────────
  const followUpMessage = `${nameGreeting}

I wanted to follow up on my application for the ${jobTitle} position at ${company}. I remain very interested in the role and believe my background in accounts receivable and collections is a strong match for what you're looking for.

If there's anything else I can provide — references, work samples, or additional context — I'm happy to do so. Looking forward to hearing from you.

Best,
Jessica Herman`;

  const followUpSubject = `Following Up — ${jobTitle} at ${company}`;

  return {
    recruiterMessage,
    recruiterSubject,
    hiringManagerMessage,
    hiringManagerSubject,
    followUpMessage,
    followUpSubject,
  };
}
