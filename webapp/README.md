# BD Medicine Price — Web App

React + Vite + TypeScript frontend that calls the same FastAPI backend as the mobile app.

## Local development

```bash
npm install
npm run dev
```

The dev server proxies `/api` → `http://localhost:8000`, so make sure the API is running first (see `../bd-medicine-app/README.md`).

## Build

```bash
npm run build
# Output: dist/
```

The built `dist/` is a static site that can be hosted anywhere (GitHub Pages, Netlify, Cloudflare Pages, etc.).

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE` | Base URL of the FastAPI backend (no trailing slash). Use empty string for same-origin. | `""` |

For GitHub Pages deployment via the included workflow, the backend must be reachable from the public internet.

## Routes

| Path | Purpose |
|---|---|
| `/` | Home — search box, stats, prescription CTA |
| `/search?q=...` | Search results (debounced) |
| `/medicine/:id` | Medicine detail + alternatives link |
| `/alternatives/:genericId` | All brands of a generic, sorted by price |
| `/prescription` | Upload a prescription image |
| `/prescription/result` | OCR + parsing results |