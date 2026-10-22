# NML Healthcare Services — Website Deployment

The website is static HTML with a Netlify serverless inquiry endpoint. The deployed website files (`index.html`, `icon.png`, and `nml-logo-uploaded.png`) are in `public/`. Do not publish the ERP.

1. Import this repository into Netlify. No build command; publish directory `public`; functions directory `netlify/functions`.
2. Verify a sending domain with Resend.
3. Set Netlify environment variables `RESEND_API_KEY`, `FROM_EMAIL` (verified domain), and `TO_EMAIL` (inquiry recipient).
4. Redeploy and test the form and email notifications. Connect the registered domain and HTTPS.

This inquiry form is not designed for PHI or clinical intake. Publish a reviewed privacy policy, configure rate limiting/spam protections, and keep the ERP private.

## Secrets scanning and environment setup

Set all three email variables in Netlify's environment variable settings with the Functions scope enabled for each deploy context that sends email. Keep the Resend key out of HTML, source files, and committed configuration. The blank `.env.example` lists names only; local `.env` files are ignored by Git.

The sender and recipient addresses are allowed to match the public contact address on the website. `netlify.toml` excludes only `FROM_EMAIL` and `TO_EMAIL` from value matching because these addresses are public content. Secrets scanning remains enabled for `RESEND_API_KEY` and other credentials. The publish directory includes only website assets, keeping documentation and function source out of the static site.

If a Resend key was exposed in an earlier commit or deploy, revoke it in Resend and configure a replacement in Netlify before redeploying. Removing a value from the current files does not remove it from repository history. Do not disable scanning or add the API key to the omission list. This configuration change does not rotate keys or change existing environment variable values.
