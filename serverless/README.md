# Contact Worker

Tiny Cloudflare Worker contact endpoint for the static Vindem Labs site.

## Required Secrets

- `RESEND_API_KEY`: Resend API key used to send email.

## Optional Variables

- `CONTACT_TO_EMAIL`: defaults to `info@vindem.tech`
- `CONTACT_FROM_EMAIL`: defaults to `Vindem Labs <contact@vindem.tech>`
- `ALLOWED_ORIGIN`: defaults to `https://vindem.tech`

## Static Site Configuration

After deploying the Worker, put its public endpoint in `docs/config.js`:

```js
window.VINDEM_LABS_CONFIG = {
  contactEmail: "info@vindem.tech",
  contactEndpoint: "https://your-worker.your-subdomain.workers.dev",
};
```

If `contactEndpoint` is empty, the site falls back to opening a prefilled email to
`info@vindem.tech`.

## Deploy

From this folder:

```sh
wrangler secret put RESEND_API_KEY
wrangler deploy
```
