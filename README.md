# BD Medicine Price

Bangladeshi medicine price lookup with prescription scanning — available as a **mobile app (Android APK)** and a **web app**.

## Layout

```
Medicine-Price/
├── webapp/                  React + Vite + TypeScript web frontend
├── bd-medicine-app/
│   ├── scraper/             Python scraper (MedEx.com.bd)
│   ├── api/                 FastAPI backend + OCR
│   ├── mobile/              React Native app (Expo)
│   └── data/                SQLite database
├── .github/workflows/
│   └── build.yml            Single CI: builds webapp + APK on every push
└── README.md
```

The mobile and web apps talk to the **same FastAPI backend** in `bd-medicine-app/api/`.

## Deployments

| Channel | Trigger | Output |
|---|---|---|
| Web app | `push` to `master` | Deployed to GitHub Pages |
| Android debug APK | `push` or `pull_request` | Artifact on the workflow run |
| Android release APK | `push` to `master` | Artifact on the workflow run |

After the first successful push:

- **Web app** → `https://<owner>.github.io/Medicine-Price/`
- **APK** → download from the Actions run's Artifacts section

> The web app's API base is configured at build time via `webapp/.env` (or `VITE_API_BASE`). Default is empty (same-origin), which only works once you also deploy the backend.

## Local development

### 1. Backend

```bash
cd bd-medicine-app/api
pip install -r requirements.txt
python server.py   # http://localhost:8000
```

The database lives at `bd-medicine-app/data/medicines.db`. To rebuild it from scratch:

```bash
cd bd-medicine-app/scraper
pip install -r requirements.txt
python database.py        # initialize schema
python medex_scraper.py   # full scrape (~30 min)
```

### 2. Web app

```bash
cd webapp
npm install
npm run dev   # http://localhost:5173 — proxies /api → http://localhost:8000
```

### 3. Mobile app

```bash
cd bd-medicine-app/mobile
npm install
npx expo start
```

`apiBase` is read from `app.json` → `expo.extra.apiBase` (defaults to `http://10.0.2.2:8000`, the Android emulator's host alias). Override at build time with `API_BASE=...` env var.

## Features

- 🔍 Search 1,600+ generic drugs, 7,800+ brands
- 💰 Price comparison across all brands of a generic
- 📸 Prescription photo scanning (PaddleOCR)
- 🌍 Works as a web app or installed APK

## Data source

Scraped from [MedEx.com.bd](https://medex.com.bd) — Bangladesh's medicine index.

## License

MIT (see `LICENSE`).