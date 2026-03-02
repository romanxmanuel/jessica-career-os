// Template-based apply packet generator — deterministic, no LLM.
// Uses only resume data + job description. Never invents experience.

import type { Job, ResumeProfile } from "@/db/schema";
import { extractSkills } from "@/lib/scoring/keywords";

interface PacketInput {
  job: Job;
  resume: ResumeProfile;
}

interface Packet {
  coverLetter: string;
  tailoredResume: string;
  outreachMessage: string;
  screeningQa: string;
}

export function generatePacketTemplate({ job, resume }: PacketInput): Packet {
  const jdSkills = extractSkills(job.rawJd);
  const resumeSkills: string[] = JSON.parse(resume.skills ?? "[]");

  // Find overlapping skills to highlight
  const matchedSkills = resumeSkills.filter((rs) =>
    jdSkills.some(
      (js) =>
        rs.toLowerCase().includes(js.toLowerCase()) ||
        js.toLowerCase().includes(rs.toLowerCase())
    )
  );
  const topSkills = matchedSkills.slice(0, 4).join(", ");

  const coverLetter = `Dear ${job.company} Hiring Team,

I'm writing to apply for the ${job.title} role. With ${resume.yearsExperience ?? 5}+ years in ${resume.headline ?? "product management"}, I bring direct experience in ${topSkills || "the key areas you're hiring for"}.

[Add 1–2 sentences highlighting your most relevant achievement from your resume that directly maps to this role's top requirement. Do NOT fabricate — pull directly from your experience.]

[Add a sentence about why this company specifically excites you.]

I'd love to bring this experience to the ${job.title} role at ${job.company}. Looking forward to connecting.

Best,
[Your Name]
[Email] | [LinkedIn] | [Phone]`;

  const tailoredResume = `TAILORED HIGHLIGHTS FOR: ${job.title} at ${job.company}
================================================
Select the bullets below that best match this role. Edit to add specific numbers if available in your memory.

MATCHED SKILLS: ${topSkills || "Review JD and map manually"}

SUGGESTED BULLET REWRITES:
Pull from your base resume and reframe using the JD's language.

JD KEY PHRASES TO MIRROR:
${jdSkills.slice(0, 8).map((s) => `• ${s}`).join("\n")}

ACTION: Copy your 3–5 most relevant bullets from your base resume, then tune the language to match the above phrases.`;

  const outreachMessage = `Hi [First Name],

I noticed you're on the team at ${job.company} and recently applied for the ${job.title} role.

I have ${resume.yearsExperience ?? 5}+ years of ${resume.headline ?? "PM experience"} and am excited about what ${job.company} is building. Would love to hear more about the team if you have 15 minutes.

Thanks,
[Your Name]`;

  const screeningQa = JSON.stringify([
    {
      question: `Why ${job.company}?`,
      answer: `[Personalize: What specifically about ${job.company}'s product, mission, or stage excites you? Reference something real — a product you use, a recent launch, their growth trajectory.]`,
    },
    {
      question: `Describe a relevant achievement in ${jdSkills[0] ?? "your core skill area"}.`,
      answer: `[Pull a specific achievement from your resume. Format: Situation → Action → Result with a metric. E.g., "At [Company], I led X which resulted in Y (metric)."]`,
    },
    {
      question: "What is your approach to prioritization?",
      answer: `I use a combination of impact vs. effort scoring and OKR alignment. At [Company], I applied this when [brief example from resume]. The result was [metric/outcome].`,
    },
    {
      question: "Describe a time you worked with a difficult stakeholder.",
      answer: `[Pull a real example from your experience — ideally one where you changed someone's mind or aligned competing interests. Format: Context → Your approach → Outcome.]`,
    },
  ]);

  return { coverLetter, tailoredResume, outreachMessage, screeningQa };
}
