import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  jobType: text("job_type").default("full-time"),
  remote: integer("remote", { mode: "boolean" }).default(false),
  url: text("url"),
  rawJd: text("raw_jd").notNull(),
  parsedSkills: text("parsed_skills"), // JSON string[]
  fitScore: integer("fit_score"),
  fitBreakdown: text("fit_breakdown"), // JSON object
  status: text("status").default("new"), // new | queued | applying | applied | archived
  priority: integer("priority").default(0), // 1=high, 0=normal, -1=skip
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const resumeProfiles = sqliteTable("resume_profiles", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  content: text("content").notNull(),
  skills: text("skills"), // JSON string[]
  headline: text("headline"),
  yearsExperience: integer("years_experience"),
  targetRoleLevel: text("target_role_level"), // junior | mid | senior | staff | director
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id),
  resumeId: text("resume_id").references(() => resumeProfiles.id),
  status: text("status").default("draft"),
  // draft | human_review | submitted | interviewing | offer | rejected | ghosted
  coverLetter: text("cover_letter"),
  tailoredResume: text("tailored_resume"),
  screeningQa: text("screening_qa"), // JSON [{question, answer}]
  outreachMessage: text("outreach_message"),
  humanApprovedAt: integer("human_approved_at", { mode: "timestamp" }),
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const followUps = sqliteTable("follow_ups", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  type: text("type").notNull(), // initial | week1 | week2 | thank_you
  status: text("status").default("pending"), // pending | sent | skipped
  message: text("message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  jobId: text("job_id").references(() => jobs.id),
  name: text("name"),
  title: text("title"),
  linkedinUrl: text("linkedin_url"),
  email: text("email"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const dailySprints = sqliteTable("daily_sprints", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD
  goalCount: integer("goal_count").default(5),
  completedCount: integer("completed_count").default(0),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type ResumeProfile = typeof resumeProfiles.$inferSelect;
export type NewResumeProfile = typeof resumeProfiles.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type FollowUp = typeof followUps.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type DailySprint = typeof dailySprints.$inferSelect;
