# CIET Mechanical Engineering Portal

The portal uses React/Vite and the existing Express API in one Vercel project, with Supabase PostgreSQL/Storage for production persistence. Local development can continue to use the JSON files under `data/`.

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
In production, Vercel serves the Vite build and routes `/api/*` to the Express
function in `api/[...route].js`. The frontend calls same-origin `/api` by
default; `VITE_API_BASE_URL` is optional. Login/register use the existing
Express bcrypt/JWT authentication backed by Supabase `portal_state` JSONB; the
app does not use Supabase Auth or MySQL. Uploaded files use the
`portal-uploads` Supabase Storage bucket.

## Deploy to Vercel

Keep the project root at `.`. `vercel.json` bundles `api/**/*.js`, publishes
the Vite `dist` output, and leaves `/api/*` paths out of the SPA rewrite.
`api/auth/login.js`, `api/auth/register.js`, `api/auth/me.js`, and
`api/health.js` all export the existing Express app from `server.js`; the
catch-all function handles the rest of `/api/*`. There is no duplicate auth
implementation.

Required Vercel server environment variables:

- `JWT_SECRET`: a long random secret, stable across deployments
- `SUPABASE_URL`: the Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase service-role/secret key

`VITE_API_BASE_URL` is not required for the same-origin setup; the client
defaults to `/api`. If explicitly set, use `/api`. Optional browser Supabase
variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are only needed if
frontend code imports `src/services/supabase.js`; never expose the service-role
key with a `VITE_` prefix.

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
4. Redeploy Vercel, then verify `https://<your-domain>/api/health` returns
   `status: ok` and `database.status: connected`. Test register/login from the
   same Vercel domain.

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
