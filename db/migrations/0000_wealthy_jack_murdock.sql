CREATE TABLE `applications` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`resume_id` text,
	`status` text DEFAULT 'draft',
	`cover_letter` text,
	`tailored_resume` text,
	`screening_qa` text,
	`outreach_message` text,
	`human_approved_at` integer,
	`submitted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resume_id`) REFERENCES `resume_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text,
	`name` text,
	`title` text,
	`linkedin_url` text,
	`email` text,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_sprints` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`goal_count` integer DEFAULT 5,
	`completed_count` integer DEFAULT 0,
	`notes` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `follow_ups` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`due_date` integer NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending',
	`message` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`location` text,
	`job_type` text DEFAULT 'full-time',
	`remote` integer DEFAULT false,
	`url` text,
	`raw_jd` text NOT NULL,
	`parsed_skills` text,
	`fit_score` integer,
	`fit_breakdown` text,
	`status` text DEFAULT 'new',
	`priority` integer DEFAULT 0,
	`salary_min` integer,
	`salary_max` integer,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resume_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`content` text NOT NULL,
	`skills` text,
	`headline` text,
	`years_experience` integer,
	`target_role_level` text,
	`is_default` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_sprints_date_unique` ON `daily_sprints` (`date`);