// AI-powered apply packet generator.
// Works with any configured provider: OPENROUTER_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY.
// Human review is ALWAYS required before submitting — enforced in HumanApprovalGate.

import { chatCompletion } from "@/lib/ai-client";
import type { Job, ResumeProfile } from "@/db/schema";

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

const SYSTEM_PROMPT = `You are a professional career coach helping a job seeker craft job application materials.

CRITICAL RULES:
1. Use ONLY facts, achievements, and skills found in the provided resume. Do NOT invent, fabricate, or embellish any experience, metric, or accomplishment.
2. If you cannot find relevant evidence in the resume, use the placeholder [ADD YOUR OWN EXAMPLE HERE].
3. Tailor the language to mirror the job description's terminology, but only where the resume genuinely supports it.
4. All output must be professional, honest, and ready for human review before submission.
5. Do NOT invent company names, job titles, metrics, or certifications that are not in the resume.`;

export async function generatePacketAI({ job, resume }: PacketInput): Promise<Packet> {
  const prompt = `Generate an apply packet for this job application.

RESUME:
${resume.content}

JOB TITLE: ${job.title}
COMPANY: ${job.company}
JOB DESCRIPTION:
${job.rawJd}

Generate the following and return as valid JSON with exactly these keys: coverLetter, tailoredResume, outreachMessage, screeningQa

1. coverLetter: A 3-paragraph cover letter using only facts from the resume. Include [PERSONALIZE] where the candidate should add company-specific research.

2. tailoredResume: The top 5 resume bullet points from the resume, rewritten to mirror the JD's language. Only use real bullets from the provided resume — do not invent new ones.

3. outreachMessage: A short (3-4 sentence) LinkedIn/email message to a potential contact at the company. Confident, not desperate.

4. screeningQa: A JSON array (as a string) of 4 common screening questions with answer drafts based strictly on the resume. Format: [{"question": "...", "answer": "..."}]

Return valid JSON only. No markdown, no explanation — just the JSON object.`;

  const text = await chatCompletion({
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 3000,
  });

  // Extract JSON from response (handle markdown code blocks if present)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON. Try again.");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    coverLetter: parsed.coverLetter ?? "",
    tailoredResume: parsed.tailoredResume ?? "",
    outreachMessage: parsed.outreachMessage ?? "",
    screeningQa:
      typeof parsed.screeningQa === "string"
        ? parsed.screeningQa
        : JSON.stringify(parsed.screeningQa ?? []),
  };
}
