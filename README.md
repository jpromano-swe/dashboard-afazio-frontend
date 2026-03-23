# Dashboard Afazio Frontend

Editorial-style academic dashboard built with Next.js 16, React 19, and Tailwind CSS v4.

## Available Routes

- `/dashboard`
- `/inbox`
- `/rates`
- `/income`
- `/reports`

## Development

```bash
npm install
npm run dev
```

## API Wiring

The app now maps the UI to the current backend contract and falls back to local mock data when the backend is unavailable or a screen depends on unfinished backend semantics.

Copy `.env.example` into your local environment:

```bash
BACKEND_BASE_URL=
BACKEND_BASIC_AUTH_USERNAME=admin
BACKEND_BASIC_AUTH_PASSWORD=admin123
CONSULTORA_SEEDS_JSON=
DEFAULT_REPORT_CONSULTORA_ID=
```

Notes:

- `BACKEND_BASE_URL` should be the absolute origin of the backend, for example `http://localhost:8080`.
- `/api/**` requests are sent with HTTP Basic Auth from the server layer.
- Rates and Excel export still need frontend consultora seed data because the backend does not expose `GET /api/consultoras`.
- Example `CONSULTORA_SEEDS_JSON`:

```json
[{"id":1,"nombre":"Accenture","descripcion":"Temporary seeded consultora","requiereReporteExcel":true}]
```

## Reference Source

The visual system and page composition were built from the HTML and screenshots stored in [`/Users/juanpabloromano/Documents/Projects/dashboard-afazio-frontend/stitch`](/Users/juanpabloromano/Documents/Projects/dashboard-afazio-frontend/stitch).
