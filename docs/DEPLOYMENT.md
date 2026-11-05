# Metron publication and GitHub Pages deployment

Status at preparation: **local-only; GitHub repository and Pages site not yet verified**. Do not mark published flags true before verifying the real URLs.

## Target

- Repository: `https://github.com/andydrewie/metron`
- GitHub Pages URL (once activated): `https://andydrewie.github.io/metron/`
- Branch: `main`
- Pages source: **GitHub Actions**
- License: MIT; public repository

## 1. Create a public repository

GitHub's current connector can read and commit to existing repositories but does not expose `create repository`. On GitHub.com: use **New repository**, owner `andydrewie`, name `metron`, visibility **Public**. Leave README/license/gitignore unchecked because the local project already includes them.

Alternatively, if the GitHub CLI is authenticated locally, the repository includes `scripts/publish.sh`, which creates and pushes the repository after explicitly checking that the remote does not already exist.

## 2. Push the complete source

From a terminal containing the unzipped Metron source:

```bash
npm run ci
npm run release:check
git init -b main
git add .
git commit -m "chore: publish Metron research instrument"
git remote add origin https://github.com/andydrewie/metron.git
git push -u origin main
```

If `git` has already been initialized or the remote has been configured, inspect `git status` and `git remote -v` first; do not blindly reinitialize or overwrite anything. GitHub CLI or Git Credential Manager handles authentication. Never paste tokens into issues, commits or chat.

## 3. Enable Pages

Open **Repository → Settings → Pages → Build and deployment → Source → GitHub Actions**. The checked-in `.github/workflows/pages.yml` runs `npm run ci`, builds `dist/`, uploads the artifact, and deploys using the official Pages action. A production URL is returned by the deployment job when successful.

## 4. Verify the release

- GitHub repository exists publicly, with the Metron README and screenshots.
- Actions `Checks` passes.
- Actions `GitHub Pages` passes; open the deployment URL returned by GitHub.
- Test Energy / Readiness / Body, mobile and desktop, slider recalculation, JSON export.
- Check favicon, Open Graph thumbnail, metadata and code source links.
- Confirm no health data is uploaded; all computations are client-side in the current version.
- Only after confirmation: change `repositoryPublished` and `pagesVerifiedLive` in `metron.manifest.json`; update README publication banner.

## Current limitations

- Direct WHOOP / Garmin / Apple Health sync: **not shipped**.
- Caloric Allowance: **not shipped** (subtitle documents intended scope).
- Research-grade accuracy and prospective training-outcome validation: **not yet established**.

## Release safety

No API keys, medical records or real wearable exports belong in the public repository. Use synthetic data examples. Keep the headless engine independent of the website and of optional future wearable integrations.

Official reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Research Instrument visual release requirements

- `design/tokens.json` is canonical; `npm run build` regenerates `design/tokens.css` and copies both the UI and token CSS into `dist/`. Do not copy `index.html` alone.
- `og.svg` and `og.png` are the matching white Open Graph identity; GitHub social preview is configured manually in **Settings → General → Social preview** after publication.
- `docs/assets/architecture.svg` and `docs/assets/evidence-loop.svg` are editable explanatory diagrams.
- Actual `docs/assets/mobile.png` and `desktop.png` must match the released code (and all three tabs must be smoke-tested).
- `npm run release:check` verifies required files, generated tokens, manifest pointers, and that the public URL flags remain unverified. It does **not** prove the live deployment works.

Once the site is genuinely live, update the repository status and verify the URL using the Pages deployment job—not by assuming the target address works.
