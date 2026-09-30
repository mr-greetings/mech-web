# CIET Mechanical Engineering Portal

The portal uses React/Vite on the frontend, Express for the API, and local JSON files under `data/` for persistence. It is not a Next.js, PostgreSQL, or Prisma project.

## Run locally

```bash
npm install
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` and `/uploads` to Express on `http://localhost:4000`.

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
