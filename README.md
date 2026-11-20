# Dyunetra Assistant: setup guide

```
Visitor's browser           Cloudflare Worker             Optional upstream
chatbot.js + .css  ──────▶  chatbot/worker.js      ──────▶ OpenAI-compatible API
(on your website)           Workers AI, rate limits,       (only if configured)
                            company knowledge
```

The browser never sees your API key. It only talks to the Worker.

## Files

| File | Where it goes |
|---|---|
| `src/assets/js/chatbot.js`, `src/assets/css/chatbot.css` | Built and deployed with the website |
| `chatbot/worker.js`, `chatbot/wrangler.toml` | Deployed to Cloudflare Workers |

## Step 1: Deploy the Worker

The Worker uses Cloudflare Workers AI with `@cf/meta/llama-4-scout-17b-16e-instruct`; no external API key is required for the primary path. Usage follows the Cloudflare account's current quota and pricing. From the `chatbot` directory:

```bash
npx wrangler login
npx wrangler deploy
```

The website already calls `https://dyunetra-chat.dyunetra-1inlv.workers.dev`.

Quick test:

```bash
curl -s https://dyunetra-chat.dyunetra-1inlv.workers.dev \
  -H "Origin: https://dyunetra.dpdns.org" -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is MEVONU?"}]}'
```

You should get `{"reply":"..."}`.

## Optional upstream fallback

If you want a separate OpenAI-compatible provider as a fallback, configure a stable public HTTPS URL ending in `/v1` as `UPSTREAM_BASE_URL` in `chatbot/wrangler.toml`, then set its key as a Worker secret:

```bash
npx wrangler secret put UPSTREAM_API_KEY
```

Do not use a temporary `trycloudflare.com` quick tunnel; it stops working when its tunnel process ends.

## Customising

- **Knowledge:** edit the `KNOWLEDGE` text in `chatbot/worker.js`, then deploy from the `chatbot` directory.
- **Colours:** change the `--dyu-*` variables at the top of `src/assets/css/chatbot.css` (accent is currently cyan; match it to your brand).
- **Limits:** `RATE_LIMIT`, `MAX_CHARS`, and `MAX_MESSAGES` are at the top of `chatbot/worker.js`. Rate limiting is best-effort.
- **Allowed sites:** `ALLOWED_ORIGINS` in `chatbot/wrangler.toml` (comma-separated).

## Safety design

- Any optional upstream API key lives only in the Worker secret.
- Only your site's origin may call the Worker.
- Clients can send only user/assistant messages, so no one can inject a system prompt. Message count and length are capped.
- The system prompt forbids invented facts and attack instructions, and sends unknowns to your Contact page.
- The widget renders replies with HTML escaping, with only links, bold and italics allowed.
