# Dynamo Database

ScyllaDB database for Dynamo, the research-paper website. The Node.js backend is the only application layer that should query ScyllaDB; React uses the backend REST API.

> **Status:** This describes the starter local Docker/schema configuration discussed for the project. Check actual repository files before treating it as deployed or implemented.

## Prerequisites

- Docker Desktop with Docker Compose
- A Docker Compose file defining a `scylladb` service
- `database/init.cql` containing the Dynamo schema

## Start the database

Run from the repository directory containing `docker-compose.yml`:

```powershell
docker compose up -d
docker compose ps
docker compose logs -f scylladb
```

The local development configuration should bind port `9042` to `127.0.0.1` and use a named volume mapped to `/var/lib/scylla`. Do not expose the database publicly.

## Initialize schema

Once ScyllaDB is ready:

```powershell
docker cp .\database\init.cql dynamo-scylladb:/tmp/init.cql
docker exec dynamo-scylladb cqlsh -f /tmp/init.cql
```

These commands assume the Compose container is named `dynamo-scylladb`. Running `docker compose up` alone does **not** automatically apply `init.cql` in this setup.

Verify:

```powershell
docker exec -it dynamo-scylladb cqlsh
```

```sql
DESCRIBE KEYSPACE dynamo;
USE dynamo;
DESCRIBE TABLES;
SELECT data_center FROM system.local;
```

The example schema uses a single-node local-development replication factor of 1. Production requires an appropriately configured cluster, replication, authentication, and backups.

## Starter tables

| Table | Partition key | Clustering key(s) | Purpose |
|---|---|---|---|
| `users_by_id` | `user_id` | None | Registered user account data, including `author_id` |
| `authors_by_id` | `author_id` | None | Research author profiles, with or without user accounts |
| `papers_by_id` | `paper_id` | None | Paper metadata and file location |
| `papers_by_author` | `author_id` | `paper_id` | Find papers associated with an author |
| `authors_by_paper` | `paper_id` | `author_position` | Find a paper's authors in publication order |

### Author/account rules

- Every user should have exactly one associated author profile.
- An author can exist without a user account.
- Claiming an existing author profile requires verification, not just a matching name.
- Deleting a user account must not automatically erase publication authorship.

These are application-enforced rules, not database foreign-key constraints.

### ScyllaDB modeling notes

- Design tables around supported query patterns and partition keys.
- `papers_by_author` and `authors_by_paper` are deliberately denormalized lookup tables; the backend must keep them synchronized.
- Avoid unbounded scans and `ALLOW FILTERING` as a general search strategy.
- Full-text search over titles/abstracts/keywords will require a separate search approach.
- Store large PDFs and datasets in file/object storage; save their paths and metadata in ScyllaDB.

## Connection settings for backend developers

| Setting | Local host backend | Backend in same Compose network |
|---|---|---|
| Host | `127.0.0.1` | `scylladb` |
| CQL port | `9042` | `9042` |
| Keyspace | `dynamo` | `dynamo` |
| Datacenter | Verify via `system.local` | Same |

Use the Cassandra-compatible Node.js driver with prepared CQL statements.

## Schema changes

- Keep CQL schema files version-controlled.
- `CREATE TABLE IF NOT EXISTS` does not migrate an existing table's columns or data.
- For schema changes after initial setup, write explicit, reviewed migration scripts and coordinate backend changes.
- Do not reset the named volume just to apply a schema change.

## Docker data persistence

The named Docker volume stores ScyllaDB data across ordinary container recreation. `docker compose down` preserves the volume; **`docker compose down -v` deletes it**. Back up important data before destructive operations.

## Frontend integration

Frontend developers do **not** need a ScyllaDB driver or direct database credentials. They should run the backend and use its documented endpoints, e.g. `GET http://localhost:3000/api/authors/{id}`. See the backend README for request/response formats and API status.

## Troubleshooting

- **Connection refused:** Wait for ScyllaDB startup and check `docker compose logs scylladb`.
- **Keyspace not found:** Apply `database/init.cql` and confirm its execution succeeded.
- **No tables:** Run `DESCRIBE TABLES;` after `USE dynamo;`.
- **Wrong datacenter:** Check `SELECT data_center FROM system.local;` and update backend configuration.
