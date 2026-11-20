# Dyunetra Assistant — deployment checklist

## Files
| File | Purpose |
|---|---|
| `chatbot/worker.js` | Cloudflare Worker and company knowledge |
| `chatbot/wrangler.toml` | Workers AI binding and allowed site origins |
| `src/assets/js/chatbot.js` | Website chat widget |
| `src/assets/css/chatbot.css` | Widget styles |

## How replies work

The Worker uses Cloudflare Workers AI with `@cf/meta/llama-4-scout-17b-16e-instruct`. No external API key is needed for this primary path. Workers AI usage follows the account's current quota and pricing. If Workers AI is unavailable, the Worker returns a temporary error unless an optional upstream is configured.

## Deploy

1. **Optional fallback:** configure `UPSTREAM_BASE_URL` in `chatbot/wrangler.toml` with a stable, public HTTPS OpenAI-compatible API URL ending in `/v1`, then set `UPSTREAM_API_KEY` as a Worker secret. Do not use a temporary `trycloudflare.com` quick tunnel; its address can stop working.

2. **Deploy** from the `chatbot` directory:
   ```
   npx wrangler deploy
   ```
   Run `npx wrangler login` first if Wrangler is not already authenticated.

3. **Site wiring:** `src/partials/footer.html` already points to `https://dyunetra-chat.dyunetra-1inlv.workers.dev`. No website rebuild is needed unless that URL changes.

4. **Test** the Worker:
   ```
   curl -s https://dyunetra-chat.dyunetra-1inlv.workers.dev -H "Origin: https://dyunetra.dpdns.org" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"What is MEVONU?"}]}'
   ```
   Expect `{"reply":"..."}`.

## Already configured
- The Worker has a Workers AI binding and is deployed at the URL used by the website widget.
- Allowed origins include the apex and `www` site domains.
- The Worker limits request size and rate, restricts message roles, and keeps any upstream API key in a Worker secret.
- The widget escapes model replies before rendering and supports only basic formatting and links.
