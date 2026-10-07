# Contributing to PRAGATI SETU

Thanks for contributing! This repo uses a **PR-based workflow with release-on-merge**: every merge to `main` auto-tags a `demo-vX.Y.Z` release and deploys to GitHub Pages.

## Ground rules

- All data is **100% SYNTHETIC** — never commit real project, personal, or government data.
- Keep the domain logic pure: components call `store` actions and read derived values from `lib/engine.js`. No `localStorage` access in components, no health/SLA math in JSX.
- Bilingual: user-facing strings go through `i18n.js` (`EN` / `हिं`).

## Workflow

1. Fork / branch off `main`:
   - `feat/<short-name>` — new feature
   - `fix/<short-name>` — bug fix
   - `docs/<short-name>` — docs only
2. Run locally:
   ```bash
   npm install
   npm run dev
   npm run build
   ```
3. Open a Pull Request against `main`. CI (`Validate Demo`) must pass.
4. After merge: `Release Demo + Deploy Pages` auto-bumps the patch version, creates a GitHub Release (`demo-vX.Y.Z` + notes), and publishes `dist/` to Pages.

## What makes a good PR

- Small, single-purpose, with a clear title (`feat:`, `fix:`, `docs:`).
- Screenshots/GIF for UI changes.
- Demo credentials still work (`secy-mospi` / `ro-triage` / `ee-sharma` / `admin-demo`).

## Reporting issues

Open an issue with: role used, page/view, steps to reproduce, expected vs actual, browser + screenshots.
