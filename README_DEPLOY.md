# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. The `public/` directory contains the published website's `index.html`, `icon.png`, and `nml-logo-uploaded.png`. Server-side functions and deployment documentation remain outside the publish directory. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `public`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set Netlify environment variables `RESEND_API_KEY`, `FROM_EMAIL` (verified domain), and `TO_EMAIL` (the inquiry recipient address).
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.

Secrets scanning remains enabled. `TO_EMAIL` alone is omitted from value matching because it is the intentionally public website contact address. Never omit `RESEND_API_KEY` or disable scanning. Keep credentials in Netlify environment variables with Functions scope; do not commit local `.env` files. The `.env.example` file lists variable names only.
