StudyMate AI — PRD, Architecture & Build Plan (v0.1)

Last updated: Nov 2, 2025

⸻

0) Pitch 

Students waste hours condensing lecture notes and drafting respectful, context-rich emails to professors.
StudyMate AI lets them upload notes (.txt or .pdf), get a high-signal summary with key points and quiz questions in seconds, and generate a polished academic email using that context. It’s privacy-first, fast, and designed with academic integrity in mind.

⸻

1) Problem, Users, and Goals

Problem
	•	Students spend 30–90 minutes per week per class summarizing notes and writing emails.
	•	Summaries are inconsistent, incomplete, and time-consuming.
	•	Communicating with professors often causes anxiety or delays.

Primary User Persona 
Name: Jordan 
Profile: Full-time college student taking 5 courses, works part-time 15 hours/week.
Pain Points: Limited time, messy notes, stress about email tone.
Goals: Quickly summarize notes, communicate clearly, save study time.

Top Goals (MVP)
	1.	Reduce time-to-summary to ≤ 3 seconds for short notes (≤ 1 page) and ≤ 6 seconds for 5-page PDFs.
	2.	Achieve CSAT ≥ 4.2 / 5 on output quality during pilot testing.
	3.	Reach 7-day returning users ≥ 30 % in a small beta test (10–15 users).

⸻

2) Success Metrics & Guardrails

Metric Type	      Metric	                               Target	                       Why It Matters
Adoption	|  Day-1 sign-ups, % who complete first summary	|80 %	                   | Measures onboarding clarity
Engagement	|  Avg. summaries/user/week	                    |3+	                       | Tracks real usage
Satisfaction|	CSAT (1–5 stars after each summary)	        | ≥ 4.2	                   | Evaluates output quality
Latency	    |Avg. time from upload → summary	            |≤ 3 s (txt) / ≤ 6 s (pdf) | Ensures fast experience
Retention	|Returning users after 7 days	                |≥ 30 %	                   | Measures product stickiness

Non-Functional Targets
	•	Cost per request ≤ $0.05
	•	Availability ≥ 99 % for MVP
	•	Data privacy = Opt-in storage, user-controlled deletion

⸻

3) Scope

In-Scope (MVP)
	1.	Upload .txt/.pdf (reject scanned image PDFs).
	2.	Summarize → TL;DR + 5 key points (≤ 12 words each) + 3 quiz questions.
	3.	Draft email → inputs: professor name, course code, purpose, optional deadline.
	4.	History list with search and per-item rating (1–5 stars + comment).
	5.	Settings page: toggle data retention, delete/export my data.

Out-of-Scope
	•	Voice input
	•	Multi-language support
	•	Collaborative editing
	•	Mobile apps or LMS integration

Ethics
	•	Banner: “Assistive output — verify accuracy and follow your school’s academic policy.”
	•	No storage without consent; full account deletion supported.

⸻

4) System Architecture (MVP)

Frontend: Next.js 14 (App Router, Tailwind)
Auth & DB: Supabase (Postgres + Auth + Row-Level Security)
AI Model: OpenAI GPT-4o-mini (API)
Deployment: Vercel
Observability: Basic request logging + events table
Realtime: Supabase Realtime channel verified for live updates (internal testing)

High-Level Flow
	1.	User logs in → uploads file
	2.	Parse text from .txt or .pdf
	3.	Call /api/summarize (OpenAI) → return summary JSON
	4.	Save summary + metadata in Supabase
	5.	User can rate, view history, and draft an email from that summary

⸻

5) API Overview

POST /api/summarize
Input: File (.txt/.pdf)
Output: { summaryId, latency_ms }

POST /api/draft-email
Input: { professor_name, course_code, purpose, deadline? }
Output: { subject, body }

POST /api/rate
Input: { summary_id, rating }
Output: Confirmation only.

⸻

6) Data Model (simplified)

Tables in Supabase:
	•	documents → user_id, title, source_type, raw_text
	•	summaries → doc_id, summary, key_points, quiz, latency_ms
	•	feedback → summary_id, rating, comment
	•	events → user_id, name, props, created_at

All tables use Row-Level Security so users can only see their own data.

⸻

7) Prompts

Summarization (System)

“You are a precise academic assistant. Produce concise, factual outputs. If unsure, say ‘not enough context.’”

Summarization (User)

“Summarize the following lecture notes for an undergraduate.
Return JSON with: TL;DR (≤ 75 words), 5 key points, 3 quiz Q&A items, and 2–3 ‘further reading’ topics.”

Email Draft (System)

“Professional academic email assistant. Clear, respectful, 120–180 words, concise subject, one CTA, gratitude.”

⸻

8) Analytics Plan

Tracked Events:
	•	user_signed_up
	•	file_uploaded
	•	summary_generated
	•	email_drafted
	•	rating_submitted

Key metrics you’ll review on your admin page:
	•	Daily Active Users (DAU)
	•	Median summary latency
	•	Funnel: upload → summary → email → rating

⸻

9) Non-Functional Requirements
	•	Latency: Chunk long docs, show loading states.
	•	Reliability: Retry API on errors, show graceful fallback.
	•	Security: Never log raw text; rotate API keys; enforce RLS.
	•	Accessibility: Proper labels, contrast ≥ 4.5:1, keyboard navigation.

⸻

10) Test Plan
	•	Unit: PDF/text parsing, prompt formatting.
	•	Integration: /api/summarize end-to-end.
	•	E2E: Upload → Summary → Rating → Email flow.
	•	Acceptance:
	•	P95 latency ≤ 3 s (txt) / ≤ 6 s (pdf).
	•	CSAT ≥ 4 / 5 from ≥ 5 users.

Note:
Latency = how long it takes from the moment a user uploads their file → to when the AI summary appears.
P95 = “95th percentile,” meaning 95% of users should get results faster than that time.

⸻

11) Launch Checklist
	•	Vercel project + domain
	•	Supabase schema + RLS enabled
	•	Env vars set (OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, etc.)
	•	Privacy page visible
	•	Basic metrics dashboard ready
	•	Demo script recorded
