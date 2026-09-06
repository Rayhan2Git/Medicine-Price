# Medicine-Price — agent memory

## What this project is

A Bangladeshi medicine price reference: webapp + Android (Expo/React Native) APK,
deployed automatically on every push to `master` via GitHub Actions.

- **Live webapp**: https://rayhan2git.github.io/Medicine-Price/
- **Source of truth for medicine data**: `bd-medicine-app/data/medicines.db` (SQLite)
  — a 7,841-brand MedEx-derived catalogue that the webapp now ships as bundled JSON.
- **Webapp**: `webapp/` (Vite + React 18 + React Router + TypeScript).
- **Android**: top-level `App.tsx` + `app.json` (Expo, prebuilt at CI time).
- **CI**: `.github/workflows/build.yml` — one workflow with two jobs:
  1. `Build & deploy webapp` (always succeeds; deploys to GitHub Pages)
  2. `Build Android APK` (currently has a Kotlin/Compose mismatch — see below)

## Critical deployment gotcha: GitHub Pages subpath

The webapp is served at `/Medicine-Price/`, not at the site root. This is **not**
transparent. Two separate bugs surfaced because of it:

1. **React Router**: `BrowserRouter` with absolute `to="/search"` paths navigated to
   `https://rayhan2git.github.io/search` (strips the `/Medicine-Price/` base). **Fix**:
   use `HashRouter` — URLs become `#/search` and work under any subpath without
   needing a `basename` prop. Already in `webapp/src/main.tsx`.

2. **Data fetches**: `fetch("/data/medicines-index.json")` resolves against the site
   root, so it 404'd. **Fix**: use `fetch(\`${import.meta.env.BASE_URL}data/...\`)`
   which Vite injects as `./` from the `base: "./"` config. Already in
   `webapp/src/dataClient.ts`.

**Lesson for future PRs touching routing or data loading**: anything that builds a URL
string from scratch must use `import.meta.env.BASE_URL` (or be relative), not start
with `/`. Audit `grep -rE 'fetch\("/|"/[a-z]+/' webapp/src/` before merging anything
that touches routing, data, or asset paths.

## Known: Android APK build is currently broken

The `Build Android APK` job fails on `gradlew assembleDebug` with a Kotlin/Compose
version mismatch. The job has `continue-on-error: true` so it doesn't block the
workflow. **Do not** try to "fix" the gradle config without first reproducing the
build locally — the cause appears to be `expo-modules-core` requiring Kotlin 2.x
vs. the legacy Compose compiler in the prebuilt android template. Deferred from
Phase 1; revisit as a separate workstream.

## Useful commands

- Local webapp dev: `cd webapp && npm install && npm run dev`
- Local webapp build + serve: `cd webapp && npm run build && npx vite preview --port 4174`
- Verify a search locally: `http://localhost:4174/#/search?q=napa`
- Force a fresh Pages deploy: `git commit --allow-empty -m "trigger" && git push`
- Check CI runs: `gh run list --limit 3` (or the GitHub UI)
- Inspect a deployed bundle: `curl -s "https://rayhan2git.github.io/Medicine-Price/assets/index-<hash>.js" | grep -oE 'medicines-[a-z]+\.json'`

## Branching & PR pattern

`phase1-webapp-apk-ci` is the active development branch. Squash-merge PRs to `master`
to trigger the deploy. After merging, wait for the post-merge CI run to complete and
verify on the live URL. The webapp deploy step is fast (~30s); the APK step takes
several minutes even when failing.
