# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. The deployable website files (`index.html`, `icon.png`, and `nml-logo-uploaded.png`) are in `public/`. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `public`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set `RESEND_API_KEY`, `FROM_EMAIL` (a verified sender), and `TO_EMAIL` (the recipient) as Netlify environment variables available to Functions. Keep their values out of repository files.
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.

The recipient address is intentionally displayed as public contact information on the website. `netlify.toml` excludes only `TO_EMAIL` from secrets scanning; `RESEND_API_KEY`, `FROM_EMAIL`, and all other values remain scanned. Do not add API keys to this exception or disable scanning. The publish directory excludes repository documentation and function source from static hosting.

Local `.env` files are ignored; `.env.example` contains placeholders only. If an API key was exposed in any earlier commit, revoke and replace it in Resend, update the Netlify environment variable, and coordinate removal from repository history with the repository owner. These deployment changes do not rotate keys or rewrite Git history.
