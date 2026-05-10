# Vindem Labs Site

Static GitHub Pages site for Vindem Labs.

## Files

- `docs/`: public web root for GitHub Pages hosting
- `docs/index.html`: the full single-page site
- `docs/config.js`: public client-side contact email configuration
- `docs/assets/favicon.svg`: browser icon
- `docs/assets/og-card.svg`: social sharing preview
- `docs/.nojekyll`: tells GitHub Pages to serve files as-is
- `.local-automation/`: local workflow scripts that are not part of the hosted site

GitHub Pages deploys through `.github/workflows/pages.yml`, which uploads only the `docs/`
folder. Repo automation, README files, and workflow notes are not included in the hosted
artifact.

`.github/workflows/sync-deploy-branch.yml` also mirrors only the contents of `docs/` to the
dedicated `deploy` branch. That branch is a clean deploy artifact branch and should not contain
repo automation, README files, or source-only workflow notes. The branch is updated with normal
history so downstream hosts can pull it without reconciling force-rewritten commits.

## Contact form

The contact form is designed for a static hosting setup. It opens the visitor's email client with
the form details prefilled and addressed to `info@vindem.tech`; no backend or hosted form relay is
required.

The destination email is configured in `docs/config.js` as `contactEmail`.

To submit without opening an email client, deploy the Worker in `serverless/contact-worker.js` and
set `contactEndpoint` in `docs/config.js` to the Worker URL. The static form will then POST to that
endpoint and email `info@vindem.tech` from the Worker.
