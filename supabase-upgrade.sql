-- ============================================================
-- Dyunetra blog upgrade: editable posts + author-friendly fields
-- Run this ONCE in Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Allow updating posts via dashboard (RLS already allows public SELECT of published rows)
-- The dashboard/service role bypasses RLS, so edits from Table Editor always work.
-- (No additional policy needed for editing from the dashboard.)

-- Widen category list (adds more topics you might use later)
alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('forensics','detection','ai','cloud','blockchain','consulting'));

-- Optional image per post (used on cards if set)
alter table public.posts add column if not exists cover_url text;

-- Seed three starter posts so the blog looks populated while you write
insert into public.posts (slug, title, category, excerpt, body, read_time, published)
values
('why-offline-first-forensics','Why digital forensics should work offline-first','forensics',
 'Evidence is sensitive, and the tools that handle it should not need to phone home.',
 E'Digital investigations often involve seized devices, confidential data and strict chain-of-custody rules. A tool that uploads artefacts to a third-party cloud introduces risks that are hard to justify in front of a court or a client.\nAn offline-first platform keeps analysis on hardware you control. That makes it usable in air-gapped labs, remote field work and regulated environments, and it removes a whole class of questions about where evidence went.\nOffline does not have to mean unintelligent. Local AI-assisted triage can surface what matters, provided each action is logged and each finding explains itself. That is the principle behind MEVONU.',
 '3 min read', true),

('from-benchmarks-to-working-ids','From benchmark datasets to a working IDS','detection',
 'CIC-IDS2017, CSE-CIC-IDS2018 and UNSW-NB15 are a starting point, not a finish line.',
 E'Public intrusion datasets give researchers a common yardstick. Training deep learning models on several of them exposes a model to many attack families and traffic patterns, which helps it generalise.\nBut a benchmark score is not a security outcome. Real networks drift, attackers adapt and analysts need to know why an alert fired. A useful system pairs classification with anomaly detection, monitoring and a dashboard that turns detections into decisions.\nThat gap between model and operations is where frameworks like QEVRAXIS aim to help.',
 '4 min read', true),

('ai-employees-not-chatbots','AI employees, not unsupervised chatbots','ai',
 'Automation is only valuable when you can see, bound and audit it.',
 E'General-purpose chatbots are impressive, but handing them broad access to your files and systems is a governance problem. Who approved that action? What did it touch? Can you prove it afterwards?\nA governed AI workforce flips the model: each AI employee has a defined job, approved access, human checkpoints and a complete execution log. Teams get the speed of automation without losing accountability.\nThat is the idea behind DevAI Workforce.',
 '3 min read', true)
on conflict (slug) do nothing;
