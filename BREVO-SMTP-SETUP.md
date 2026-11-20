# Contact-form email notifications

The website is static on Cloudflare. The contact form calls `/api/contact`, where the site Worker saves the message to Supabase and submits a Brevo transactional email to `dyunetra@gmail.com`. Replies use the sender's email address.

The `dyunetra.dpdns.org` domain and `founder@dyunetra.dpdns.org` sender are verified in Brevo. Keep the Brevo API key in a Worker secret; never put it in this file or browser code.

The latest live test was accepted by Brevo but rejected by Gmail with `550 5.7.1` as likely unsolicited mail. Brevo reported no known block on the shared IP and recommended clear transactional context, expected recipients, and both HTML and plain-text content. The Worker now sends a simple escaped HTML version and matching text version that explain why the notification was sent. The form's `emailAccepted` result means Brevo accepted the API request; it does not confirm delivery. Check Brevo's transactional logs for final delivery status.

Brevo also cautioned that free or dynamic DNS domains may have reputation challenges. If Gmail continues to reject notifications, use a domain you own and control for the website and sender, then authenticate it with Brevo. Content changes alone cannot guarantee inbox delivery.

## Required one-time setup

An SMTP credential was accidentally stored in this document and has been removed. Revoke it in Brevo if you have not already done so. The Worker needs a Brevo API v3 key, not an SMTP key.

From the project root, enter the new key when Wrangler prompts:

```powershell
npx wrangler secret put BREVO_API_KEY
```

Then rebuild and deploy the site Worker:

```powershell
$env:SITE_URL = 'https://dyunetra.dpdns.org'
$env:SITE_EMAIL = 'founder@dyunetra.dpdns.org'
node .\build.mjs
npx wrangler deploy
```

Use Wrangler 4.36.0 or later for the contact form rate-limit binding. The secret value is entered interactively and must not be added to `wrangler.toml`.

The five-per-minute rate limit is approximate per Cloudflare location; it is intended for this low-volume contact form, not as a strict global abuse control.
