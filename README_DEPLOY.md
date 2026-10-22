# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. This repository must contain the public website's `index.html`, `icon.png`, and `nml-logo-uploaded.png` from the NML deployment package in its root folder. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `.`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set Netlify environment variables `RESEND_API_KEY`, `FROM_EMAIL` (verified domain), and `TO_EMAIL=website@your-verified-domain.com`.
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.
