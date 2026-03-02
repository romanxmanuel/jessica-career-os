// JSearch API client — aggregates job listings from Indeed, LinkedIn, Glassdoor, and others.
// Requires RAPIDAPI_KEY in .env.local.
// This is a legitimate aggregator API — no scraping, no ToS violations.

export interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string | null;
  job_state: string | null;
  job_country: string | null;
  job_is_remote: boolean;
  job_apply_link: string | null;
  job_description: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_employment_type: string | null;
  job_posted_at_timestamp: number | null;
}

interface JSearchResponse {
  status: string;
  data: JSearchJob[];
}

const JSEARCH_BASE = "https://jsearch.p.rapidapi.com/search";

export async function searchARJobs(apiKey: string): Promise<JSearchJob[]> {
  const queries = [
    "accounts receivable specialist Orlando Florida",
    "billing specialist Orlando Florida",
    "collections specialist Central Florida",
  ];

  const allJobs: JSearchJob[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    const params = new URLSearchParams({
      query,
      num_pages: "1",
      page: "1",
      date_posted: "week",
    });

    const res = await fetch(`${JSEARCH_BASE}?${params}`, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`JSearch API error: ${res.status} — ${err}`);
    }

    const data: JSearchResponse = await res.json();

    for (const job of data.data ?? []) {
      if (!seenIds.has(job.job_id)) {
        seenIds.add(job.job_id);
        allJobs.push(job);
      }
    }
  }

  return allJobs;
}
