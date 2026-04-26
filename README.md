# Vindem Labs Site

Static GitHub Pages site for Vindem Labs.

## Files

- `index.html`: the full single-page site
- `config.js`: public client-side form relay configuration
- `assets/favicon.svg`: browser icon
- `assets/og-card.svg`: social sharing preview
- `.nojekyll`: tells GitHub Pages to serve files as-is

## Contact form

The contact form is designed for a static hosting setup and does not display a public email
address on the page.

To route submissions privately to `vindem.labs@gmail.com`:

1. Create a Web3Forms account or another hosted form relay.
2. Set `vindem.labs@gmail.com` as the destination inbox in that service.
3. Put the provided public access key into `config.js` as `formAccessKey`.
4. Publish the updated site.

The access key is expected to be public in the browser for this kind of static form relay. The
email destination itself remains hidden from the page UI and markup.
