# Putting the site online

**Done.** The site is live at `https://magnus.is-a.dev`, served by GitHub Pages from the `mgndxb.github.io` repository (the old address redirects). The name was registered in [is-a-dev/register#59249](https://github.com/is-a-dev/register/pull/59249). The steps below are kept as a record.

Two stages. First, publish the site on GitHub Pages at `https://mgndxb.github.io`. Then, once it's live and finished, apply for a `.is-a.dev` name that points to it.

## 1. Publish on GitHub Pages

GitHub serves a repository called `<username>.github.io` at that exact address, with no extra path, so name the repository **`mgndxb.github.io`**.

1. On GitHub, create a new **public** repository named `mgndxb.github.io`. Don't add a README, .gitignore or license; this project already has them.
2. In this project folder, run:

   ```bash
   git init -b main
   git add .
   git commit -m "Portfolio site"
   git remote add origin https://github.com/mgndxb/mgndxb.github.io.git
   git push -u origin main
   ```

3. In the repository on GitHub, go to **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open the **Actions** tab. The "Deploy to GitHub Pages" workflow runs lint, typecheck, tests and the build, then publishes. When it turns green, the site is live at `https://mgndxb.github.io`.

From then on, every push to `main` redeploys the site. If a check fails, nothing is published and the old version stays up.

## 2. Get `<name>.is-a.dev`

is-a.dev is a free service run by volunteers. You claim a name by adding a small JSON file to their GitHub repository in a pull request.

**Do this part yourself.** The maintainers don't accept AI-generated pull requests and close them automatically. They want to see that a person built the site and understands what they're submitting. That's reasonable, and it's a small job.

Before you start, check these against their pull request template:

- The site is **live and finished** at `https://mgndxb.github.io`. They reject placeholder or barely changed template sites.
- It's about **software development**. A developer portfolio is exactly what the service is for.
- It's **not commercial**. Your portfolio links to client work, but it doesn't sell anything itself, so that's fine.

Then:

1. You've already forked `is-a-dev/register`. Before you add anything, use **Sync fork** on GitHub so your fork is up to date.
2. Read the [is-a.dev docs](https://docs.is-a.dev), especially the [domain structure](https://docs.is-a.dev/domain-structure/) and the [GitHub Pages guide](https://docs.is-a.dev/guides/github-pages/). Together they explain where the file goes, how to name it and which record GitHub Pages needs.
3. Pick your name. `magnuskaur` reads well on a CV.
4. Write the file, open the pull request and fill in **every** part of their template, including the link to `https://mgndxb.github.io`.
5. Watch the pull request in case a maintainer asks for changes.

## 3. Point GitHub Pages at the new name

After your pull request is merged:

1. In your `mgndxb.github.io` repository, go to **Settings → Pages → Custom domain**, enter your new `.is-a.dev` address and save.
2. Wait for the DNS check to pass, then tick **Enforce HTTPS**.
3. Change `url` in [`src/content/site.ts`](src/content/site.ts) to the new address, reprint the CV with `npm run cv` and copy `cv/out/public/*` into `public/`, then commit and push.

With a GitHub Actions deployment you set the custom domain in Settings. You don't need a `CNAME` file in the project.
