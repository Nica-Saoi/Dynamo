# Dynamo Backend

Node.js/Express REST API for the Dynamo research-paper website. The React frontend communicates with this API; it does **not** connect directly to ScyllaDB.

> **Status:** This README documents the starter API discussed for the project. Verify routes against the actual backend branch before marking them implemented.

## Prerequisites

- Node.js and npm
- Running Dynamo ScyllaDB instance with the `dynamo` keyspace and schema applied (see database README)

## Local setup

From the backend directory:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Create `.env.example` (commit this file, **not** `.env`):

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=9042
DB_DATACENTER=datacenter1
DB_KEYSPACE=dynamo
FRONTEND_ORIGIN=http://localhost:5173
```

If the backend runs in the same Docker Compose network as ScyllaDB, use `DB_HOST=scylladb`. Confirm the actual datacenter name using `SELECT data_center FROM system.local;` in `cqlsh`.

Expected API base URL for local development: `http://localhost:3000/api`.

## API endpoints (starter implementation)

| Method | Endpoint | Request | Response | Status |
|---|---|---|---|---|
| GET | `/api/health` | None | `{"status":"OK","application":"Dynamo API"}` | Starter implementation |
| GET | `/api/authors/:id` | Author UUID in URL | Author record | Starter implementation |
| POST | `/api/authors` | JSON author details | New author ID | Starter implementation; **development-only until secured** |
| GET | `/api/papers/:id` | Paper UUID in URL | Paper record | Starter implementation |

### Create an author

```http
POST /api/authors
Content-Type: application/json
```

```json
{
  "author_name": "Example Researcher",
  "affiliation": "Example University",
  "orcid": null,
  "biography": "Research interests"
}
```

Expected successful response (HTTP 201):

```json
{
  "message": "Author created",
  "author_id": "11111111-1111-4111-8111-111111111111"
}
```

The ID above is illustrative; the server generates a new UUID.

### Get an author

`GET /api/authors/{author_uuid}` returns the author's stored record, or HTTP 404 with `{"error":"Author not found"}`. An invalid UUID should return HTTP 400.

### Get a paper

`GET /api/papers/{paper_uuid}` returns a paper record, or HTTP 404 with `{"error":"Paper not found"}`. An invalid UUID should return HTTP 400.

### Error responses

Errors are JSON objects with an `error` field. Clients should handle HTTP 400, 404, and 500; additional status codes may be introduced later.

## React integration

Create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

Example frontend API helper:

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function getAuthor(id) {
  const response = await fetch(`${API_BASE}/authors/${encodeURIComponent(id)}`);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Request failed');
  return body;
}
```

This example assumes a Vite-powered React frontend. For another build tool, use its supported environment-variable convention. The backend's `FRONTEND_ORIGIN` must match the frontend's actual local URL for CORS.

## Data model notes

- Each registered user must be associated with exactly one author profile.
- An author may exist without a registered user account.
- Papers can have multiple authors; authors can have multiple papers.
- ScyllaDB does not enforce relational foreign keys, so the backend must enforce these rules.
- PDF files should live in file/object storage; ScyllaDB stores their metadata and storage paths.

## Planned endpoints (not implemented in starter code)

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/users/me`
- `POST /api/papers` and paper upload workflow
- `GET /api/papers?query=...` for search (requires an appropriate search design/index)
- `GET /api/papers/:id/authors`
- Author profile claiming and identity verification

Do not treat planned routes as available until implemented and tested.

## Security and development notes

- The starter author creation route must be protected by authentication/authorization before public deployment.
- Never expose ScyllaDB directly to the browser.
- Never commit `.env`, credentials, or private keys.
- Passwords must be securely hashed; user-to-author claiming requires identity verification.
- Add input validation, request limits, tests, and appropriate logging before production.

## Troubleshooting

- **API won't start:** Confirm ScyllaDB is running and the keyspace exists; verify host, port, and datacenter.
- **Browser CORS error:** Check `FRONTEND_ORIGIN` against the exact frontend origin.
- **404 from `/api/authors/:id`:** Verify the UUID and that a matching record exists.
- **Database timeout:** Check `docker compose ps`, `docker compose logs scylladb`, and `docker exec -it dynamo-scylladb cqlsh`.