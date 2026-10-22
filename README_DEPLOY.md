# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. The public website's `index.html`, `icon.png`, and `nml-logo-uploaded.png` live in `public/`. Only this directory is published, keeping server code, configuration, and deployment documentation out of the static site. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `public`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set Netlify environment variables `RESEND_API_KEY`, `FROM_EMAIL` (verified sender), and `TO_EMAIL` (inquiry recipient). Make them available to Functions in each deployment context that sends email. Use `.env.example` only as a template; never commit real credentials.
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.

Secrets scanning remains enabled. `TO_EMAIL` alone is excluded because the recipient address is intentionally displayed as the website's public contact address. Do not use this variable for a confidential address. `RESEND_API_KEY` and `FROM_EMAIL` remain scanned; do not add credentials to the exclusion list. If the API key was exposed in a previous commit or deploy, revoke it in Resend and set a replacement in Netlify before redeploying. Removing it from the current files does not invalidate an exposed key.
