-- Seed the 3 static sample posts into Supabase
insert into public.posts (slug, title, category, excerpt, body, read_time, published, published_at)
values
('why-offline-first-forensics','Why digital forensics should work offline-first','forensics',
 'Evidence is sensitive, and the tools that handle it should not need to phone home.',
 E'Digital investigations often involve seized devices, confidential data and strict chain-of-custody rules. A tool that uploads artefacts to a third-party cloud introduces risks that are hard to justify in front of a court or a client.
An offline-first platform keeps analysis on hardware you control. That makes it usable in air-gapped labs, remote field work and regulated environments, and it removes a whole class of questions about where evidence went.
Offline does not have to mean unintelligent. Local AI-assisted triage can surface what matters, provided each action is logged and each finding explains itself. That is the principle behind MEVONU.',
 '3 min read', true, '2026-11-01T09:00:00Z'),

('from-benchmarks-to-working-ids','From benchmark datasets to a working IDS','detection',
 'CIC-IDS2017, CSE-CIC-IDS2018 and UNSW-NB15 are a starting point, not a finish line.',
 E'Public intrusion datasets give researchers a common yardstick. Training deep learning models on several of them exposes a model to many attack families and traffic patterns, which helps it generalise.
But a benchmark score is not a security outcome. Real networks drift, attackers adapt and analysts need to know why an alert fired. A useful system pairs classification with anomaly detection, monitoring and a dashboard that turns detections into decisions.
That gap between model and operations is where frameworks like QEVRAXIS aim to help.',
 '4 min read', true, '2026-11-05T09:00:00Z'),

('ai-employees-not-chatbots','AI employees, not unsupervised chatbots','ai',
 'Automation is only valuable when you can see, bound and audit it.',
 E'General-purpose chatbots are impressive, but handing them broad access to your files and systems is a governance problem. Who approved that action? What did it touch? Can you prove it afterwards?
A governed AI workforce flips the model: each AI employee has a defined job, approved access, human checkpoints and a complete execution log. Teams get the speed of automation without losing accountability.
That is the idea behind DevAI Workforce.',
 '3 min read', true, '2026-11-08T09:00:00Z')
on conflict (slug) do nothing;
