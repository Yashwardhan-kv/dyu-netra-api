// The unified key matches. But FreeLLMAPI rejects it over the TUNNEL — meaning the
// tunnel hostname hits FreeLLMAPI's "public mode" which expects keys differently, OR
// the Authorization header got stripped by cloudflared? Test tunnel path locally with
// curl (tunnel hostname → same FreeLLMAPI):
import { execSync } from 'node:child_process';
const key = 'freellmapi-ddfd4fac01b3617b670acec4c8c34a6fd3353380bf2d7f29';
const out = execSync(`curl.exe -sS -X POST "https://api.freellma.dyunetra.dpdns.org/v1/chat/completions" -H "Authorization: Bearer ${key}" -H "Content-Type: application/json" -d "{\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"hi\\"}],\\"max_tokens\\":10}"`, { encoding: 'utf8', timeout: 30000 });
console.log(out.slice(0, 400));
