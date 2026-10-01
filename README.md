# CIET Mechanical Engineering Portal

The portal uses React/Vite on the frontend, Express for the API, and Supabase PostgreSQL/Storage for Vercel persistence. Local development can continue to use the JSON files under `data/`.

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
Vercel serves the Vite build and the Express API from the same project; `/api/*`
is handled by `api/[...route].js`, and `/uploads/*` static files are copied into
the build output. Registration, login, admin edits, and curriculum edits use
the Supabase `portal_state` row in production. Uploaded files use the public
`portal-uploads` Supabase Storage bucket. Local mode continues to use `data/`
and `uploads/`.

## Deploy to Vercel with Supabase

1. In the Supabase SQL Editor, run `supabase/migrations/20261001000000_portal_state.sql`.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a long random `JWT_SECRET`
	in the Vercel project's server environment variables. The service-role key
	must never use a `VITE_` prefix or be exposed to browser code.
3. Locally, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`. Set
	unique `INITIAL_ADMIN_PASSWORD`, `INITIAL_STAFF_PASSWORD`, and
	`INITIAL_STUDENT_PASSWORD` values there if their seeded accounts still use
	their defaults, then run `npm run migrate:supabase` once to import
	`data/db.json` and `data/r2023-curriculum.json`. The importer refuses to
	overwrite existing data and rotates the known default account passwords.
4. Redeploy the Vercel project. The frontend uses the same-origin `/api` by
	default, so `VITE_API_BASE_URL` is not needed for this setup.
5. Verify `https://<your-domain>/api/health` reports `status: ok` and
	`database.status: connected` before testing registration.

Vercel requests are limited to 4.5 MB, so cloud uploads are capped at 4 MB.
The local development server retains its 10 MB limit.
`VITE_API_BASE_URL` is only needed when hosting the frontend and API on different
origins, and must point to the API origin including `/api`.

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
