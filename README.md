# CIET Mechanical Engineering Portal

The portal uses React/Vite on Vercel, Express on Render, and Supabase PostgreSQL/Storage for production persistence. Local development can continue to use the JSON files under `data/`.

## Run locally

For local development, the server generates and reuses a random JWT secret in
the ignored `.dev-jwt-secret` file if `JWT_SECRET` is not set. Copy `.env.example`
to `.env` and set the Supabase values when importing data or using cloud storage.
Never commit `.env`, `JWT_SECRET`, or `SUPABASE_SERVICE_ROLE_KEY`.

```bash
npm install
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` and `/uploads` to Express on `http://localhost:4000`.
In production, Vercel hosts only the frontend. `VITE_API_BASE_URL` points to the
Render Express service and includes `/api`. Registration/login use the existing
Express bcrypt/JWT authentication backed by the Supabase `portal_state` JSONB
row; this project does not use Supabase Auth or MySQL. Uploaded files use the
`portal-uploads` Supabase Storage bucket. Local mode continues to use `data/`
and `uploads/`.

## Deploy Frontend and API

### Render Backend

Create a Render Web Service from this repository with root directory `.`.
`render.yaml` defines the service, or configure it manually with:

- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`

Set these Render environment variables:

- `NODE_ENV=production`
- `JWT_SECRET`: a long random secret; keep it stable to preserve active sessions
- `SUPABASE_URL`: the Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase service-role/secret key
- `FRONTEND_ORIGINS`: exact Vercel production URL and any custom domain, comma-separated

Render provides `PORT` automatically. Do not set the Supabase service-role key
with a `VITE_` prefix and never place it in frontend variables.

### Vercel Frontend

Keep the Vercel project root at `.` and build command `npm run build`; output is
`dist`. Set:

- `VITE_API_BASE_URL=https://<render-service>.onrender.com/api`
- `VITE_SUPABASE_URL`: the project URL only if browser code imports
  `src/services/supabase.js`
- `VITE_SUPABASE_ANON_KEY`: the public anon/publishable key only if browser code
  imports `src/services/supabase.js`

The application login/register flow uses the Express API, not Supabase Auth.
Rebuild/redeploy Vercel after changing `VITE_API_BASE_URL` because Vite embeds
this value into the frontend bundle.

### Supabase Setup

1. In the Supabase SQL Editor, run `supabase/migrations/20261001000000_portal_state.sql`.
   It creates the protected `portal_state` JSONB row, write-lock RPCs, and the
   `portal-uploads` storage bucket; no separate auth tables are needed.
2. Locally, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in ignored `.env`.
   If seeded passwords are still unchanged, set unique 12+ character
   `INITIAL_ADMIN_PASSWORD`, `INITIAL_STAFF_PASSWORD`, and
   `INITIAL_STUDENT_PASSWORD` values there.
3. Run `npm run migrate:supabase` once. It imports `data/db.json` and
   `data/r2023-curriculum.json`, refuses to overwrite existing cloud data, and
   rotates any known seeded default passwords.
4. Verify `https://<render-service>.onrender.com/api/health` returns
   `status: ok` and `database.status: connected`. Then test register/login from
   the deployed Vercel site.

Cloud uploads are limited to 4 MB to stay below serverless/proxy request limits.
The local development server retains its 10 MB limit.

## Official R2023 Curriculum

The Regulation 2023 source PDF is served unchanged from `/uploads/R2023-MECH-CURRICULUM-AND-SYLLABUS.pdf`. Imported searchable data is stored in `data/r2023-curriculum.json`.

Public routes use the existing hash router:

- `/#/curriculum`
- `/#/syllabus`
- `/#/regulation`
- `/#/syllabus/U23MET04`

The Express API provides `GET /api/curriculum` for filtered course summaries and `GET /api/curriculum/course/:courseCode` for one course's source text. Admin-only curriculum management endpoints use the same JSON data file.

To regenerate the import from the official source PDF, install the optional parser and run:

```bash
python -m pip install -r requirements-pdf-import.txt
python scripts/import_r2023_curriculum.py "path/to/R2023 MECH CURRICULUM AND SYLLABUS .pdf" data/r2023-curriculum.json
```

Ambiguous or missing details are flagged in the imported records rather than inferred.
