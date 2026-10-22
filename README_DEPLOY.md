# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. The deployed website files are `public/index.html`, `public/icon.png`, and `public/nml-logo-uploaded.png`. Make website edits in `public/`. Only this folder is published; deployment documentation and function source stay outside the static website. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `public`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set `RESEND_API_KEY`, `FROM_EMAIL` (a verified sender), and `TO_EMAIL` in Netlify Site configuration → Environment variables, with access for Functions in each required deploy context. Never put their values in repository files.
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.

Secrets scanning stays enabled. `netlify.toml` excludes only `TO_EMAIL` because the recipient is also the intentionally public contact address shown on the website. Do not add `RESEND_API_KEY` or `FROM_EMAIL` to this exception. If the recipient becomes private, remove the exception and remove that address from public files.

Use `.env.example` only as a template for local configuration; actual `.env` files are ignored. If an API key was exposed in an earlier revision, revoke it in Resend and replace its Netlify environment value. A source fix does not invalidate a previously exposed key.
