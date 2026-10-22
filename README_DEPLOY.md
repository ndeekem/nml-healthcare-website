# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. This repository must contain the public website's `index.html`, `icon.png`, and `nml-logo-uploaded.png` from the NML deployment package in its `public` folder. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `public`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set Netlify environment variables `RESEND_API_KEY`, `FROM_EMAIL` (verified domain), and `TO_EMAIL` (inquiry recipient).
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.

## Environment variables and secrets scanning

Set `RESEND_API_KEY`, `FROM_EMAIL`, and `TO_EMAIL` in Netlify environment settings with the Functions scope. Do not put their values in `netlify.toml`, source files, or committed environment files. For local development, copy `.env.example` to `.env` and fill in values locally; `.env` files are ignored by git.

The recipient address is intentionally displayed as a public contact address on the website. `netlify.toml` excludes only `TO_EMAIL` from environment-value secrets scanning to prevent this public address from blocking deployment. API-key scanning and scanning for other environment secrets remain enabled. If the recipient becomes confidential, remove this exception and remove that address from public files.

Only `public` is published as static content. The inquiry function is deployed separately from `netlify/functions`; repository documentation and local environment files are outside the published directory.

No configured API-key value was found in the current repository files during this fix. If a real key appeared in an earlier commit or deployment, revoke it in Resend, create a replacement, update Netlify's environment settings, and redeploy. Removing a file from tracking does not erase its git history; any history cleanup requires a separate coordinated operation.
