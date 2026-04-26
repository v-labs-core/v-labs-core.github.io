# v-labs-core.github.io

Static GitHub Pages site for the V Labs Core organization.

## Contact form setup

The contact form in `index.html` is wired for a static form relay workflow. To make the form send messages privately to `vindem.labs@gmail.com` without exposing an email address in the page source:

1. Create a Web3Forms account or equivalent hosted form relay.
2. Configure the destination inbox as `vindem.labs@gmail.com` in that service dashboard.
3. Replace `REPLACE_WITH_WEB3FORMS_ACCESS_KEY` in `index.html` with the service access key.
4. Commit and publish the updated file.

Once that key is in place, the site can stay fully static and still accept contact submissions.
