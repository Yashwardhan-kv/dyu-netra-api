// Latency test with retries
for (let i = 0; i < 2; i++) {
  const t0 = Date.now();
  const r = await fetch('https://dyunetra-chat.dyunetra-1inlv.workers.dev', {
    method: 'POST',
    headers: { 'Origin': 'https://dyunetra.dpdns.org', 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
    signal: AbortSignal.timeout(45000)
  }).catch(e => ({ err: (e.cause && e.cause.message) || e.message }));
  if (r.err) { console.log('attempt', i + 1, 'ERR:', r.err); continue; }
  const j = await r.json().catch(() => ({}));
  console.log('attempt', i + 1, '| status:', r.status, '| latency:', (Date.now() - t0) + 'ms');
  console.log('reply:', (j.reply || JSON.stringify(j)).slice(0, 250));
}
