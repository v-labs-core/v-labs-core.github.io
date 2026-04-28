# Vindem Labs Site

Static GitHub Pages site for Vindem Labs.

## Files

- `docs/`: public web root for GitHub Pages hosting
- `docs/index.html`: the full single-page site
- `docs/privacy.html`: standalone privacy policy page
- `docs/config.js`: public client-side form relay configuration
- `docs/assets/favicon.svg`: browser icon
- `docs/assets/og-card.svg`: social sharing preview
- `docs/.nojekyll`: tells GitHub Pages to serve files as-is
- `.local-automation/`: local workflow scripts that are not part of the hosted site

GitHub Pages deploys through `.github/workflows/pages.yml`, which uploads only the `docs/`
folder. Repo automation, README files, and workflow notes are not included in the hosted
artifact.

## Contact form

The contact form is designed for a static hosting setup and does not display a public email
address on the page.

To route submissions privately to `vindem.labs@gmail.com`:

1. Create a Web3Forms account or another hosted form relay.
2. Set `vindem.labs@gmail.com` as the destination inbox in that service.
3. Put the provided public access key into `docs/config.js` as `formAccessKey`.
4. Publish the updated site.

The access key is expected to be public in the browser for this kind of static form relay. The
email destination itself remains hidden from the page UI and markup.
