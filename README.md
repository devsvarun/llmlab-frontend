# README — Frontend (Next.js LLM Lab)

## LLMLab — Frontend

**Live URL:** [https://llmlab-frontend.vercel.app/](https://llmlab-frontend.vercel.app/)
**Repo:** [https://github.com/devsvarun/llmlab-frontend](https://github.com/devsvarun/llmlab-frontend)

### Overview

This repository contains the Next.js frontend for LLM Lab — a visual dashboard to test LLM parameter settings (temperature, top_p), generate multiple responses, view programmatic quality metrics, compare outputs, import/export experiments, and demo model behavior.

Tech stack:

- Next.js (App Router)
- React (client components)
- Tailwind CSS + shadcn/ui
- react-markdown / remark (markdown rendering)
- TanStack Query (optional for data fetching)
- Deployed on Vercel

### Quickstart (Local)

1. Clone:

```bash
git clone https://github.com/devsvarun/llmlab-frontend.git
cd llmlab-frontend
```

2. Install:

```bash
npm install
```

3. Create `.env.local`:

```
NEXT_PUBLIC_API_URL=https://llm-backend-xez7.onrender.com
```

4. Run locally:

```bash
npm run dev
```

Open `http://127.0.0.1:3000` (or `http://localhost:3000`) in browser.

### Project Structure (high level)

```
/app                      # Next.js app routes
/components               # Reusable UI components (LeftPanel, RightPanel, Skeleton)
/lib                      # helpers (api client, markdown rendering)
/styles                   # global styles (tailwind)
/public                   # static assets
```

### Key pages / components

- `MainConsole` — primary UI: prompt input, sliders, generate button, export/import
- `SkeletonRightPanel` — full-size skeleton while generating
- `ResponseCard` — renders a single response (markdown-safe)
- `ComparisonTable` — shows metrics per response
- `ImportButton` — import JSON experiments
- `api-client` — small fetch wrapper using `NEXT_PUBLIC_API_URL`

### Environment variables

- `NEXT_PUBLIC_API_URL` — base URL for backend (set to `https://llm-backend-xez7.onrender.com` for demo)

### How the frontend talks to backend

- POST `${API_URL}/run` with:

```json
{
  "prompt": "...",
  "params": [
    {"temperature": 0.7, "top_p": 0.9},
    ...
  ]
}
```

- Backend returns an `experiment` object; frontend reads `experiment.results`.

### Export / Import

- Export: downloads `experiment_<timestamp>.json` containing prompt, parameters, results & metrics.
- Import: file input reads JSON, validates shape, populates UI (prompt, sliders, responses).

### Notes & Known limitations

- This is a prototype for evaluation. For production:

  - Add authentication and rate-limiting
  - Replace local persistence with a DB
  - Add proper error logging and monitoring

### How to run tests (optional)

- No automated tests required for challenge; add unit tests for helper functions as needed.

### Contact / Maintainer

Varun Sharma — repo owner ([https://github.com/devsvarun](https://github.com/devsvarun))
