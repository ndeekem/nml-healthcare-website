# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. This repository must contain the public website's `index.html`, `icon.png`, and `nml-logo-uploaded.png` from the NML deployment package in its `public/` folder. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `public`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set Netlify environment variables `RESEND_API_KEY`, `FROM_EMAIL` (verified domain), and `TO_EMAIL` (inquiry recipient).
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.

## Environment variables and secrets scanning

Set all three email variables in Netlify with Functions scope for each deploy context that needs inquiry delivery. Keep real values out of source files and documentation. For local development, copy `.env.example` to `.env` and fill it in locally; `.env` and its variants are ignored by Git.

`TO_EMAIL` is also the intentionally public contact address shown on the website. The configuration excludes only that variable from value matching. Secrets scanning stays enabled for credentials such as `RESEND_API_KEY`; do not disable scanning or exclude the API key.

The publish directory contains only public site assets. Serverless function source, environment examples, and deployment documentation are outside it.

If an actual credential is ever committed, revoke and replace it with its provider and update the Netlify environment variable. Coordinate any Git history cleanup separately; deleting a value from the current files does not revoke it or erase earlier commits.
