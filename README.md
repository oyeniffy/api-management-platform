# API Management Platform

A full-stack API gateway: client onboarding, hashed API-key authentication, Redis-backed rate limiting, request logging and analytics, and a reverse proxy that forwards authenticated traffic to a client's real backend — plus a React dashboard to manage it all.

Built end-to-end with a working CI pipeline and a containerized deployment.

## What it does

1. A **client** registers with a name, email, and their backend API's base URL.
2. They're issued an **API key** (shown once, stored only as an HMAC-SHA-256 hash — never in plaintext).
3. Every request to `/proxy/*` with that key passes through:
   - **Auth** — validates the key against its stored hash, rejects invalid/revoked keys
   - **Rate limiting** — Redis-backed sliding window, per-key configurable limits, returns `429` with rate-limit headers when exceeded
   - **Logging** — records method, path, status, and response time for every call, asynchronously (never blocks the response)
   - **Proxying** — forwards the request to the client's real backend and streams the response back
4. An **analytics endpoint** and **React dashboard** expose usage data and let you manage clients/keys visually.

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full systems design, including the request lifecycle, data model, and security model (control/data plane separation, key hashing, rate-limiting strategy). Diagram source is in [`api-management-system-design.mmd`](api-management-system-design.mmd).

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, TypeScript, Express 5 |
| Database | PostgreSQL 16, via Prisma ORM |
| Cache / rate limiting | Redis 7 |
| Proxy | http-proxy-middleware |
| Dashboard | React + Vite |
| Containerization | Docker (multi-stage build) |
| CI/CD | GitHub Actions |

## Running locally

Requires Docker Desktop and Node.js 20.

```bash
# 1. Clone and install
git clone https://github.com/oyeniffy/api-management-platform.git
cd api-management-platform
npm install --legacy-peer-deps

# 2. Start Postgres and Redis
docker compose up -d

# 3. Configure environment
cp .env.example .env
# edit .env if needed — defaults match docker-compose.yml

# 4. Set up the database
npx prisma migrate dev

# 5. Run the backend
npm run dev
# → http://localhost:3000

# 6. In a second terminal, run the dashboard
cd dashboard
npm install
npm run dev
# → http://localhost:5173
```

## Running with Docker

```bash
docker compose up -d          # Postgres + Redis
docker build -t api-management-platform:latest .
docker run -d --name apm-backend \
  --network api-management-platform_default \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://apm_user:apm_password@postgres:5432/apm_db" \
  -e REDIS_URL="redis://redis:6379" \
  -e API_KEY_PEPPER="replace_with_a_long_random_secret" \
  -e PORT=3000 \
  api-management-platform:latest
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/clients` | Register a new client |
| `GET` | `/clients` | List all clients |
| `PATCH` | `/clients/:id` | Update a client's backend `baseUrl` |
| `POST` | `/clients/:id/keys` | Generate a new API key (raw key returned once) |
| `GET` | `/clients/:id/keys` | List a client's keys (no secrets exposed) |
| `GET` | `/analytics/summary` | Usage summary for the authenticated key |
| `ANY` | `/proxy/*` | Authenticated, rate-limited, logged proxy to the client's backend |

All routes under `/proxy` and `/analytics` require an `X-API-Key` header.

## What's demonstrated here

- **Security**: API keys are never stored in plaintext — only an HMAC-SHA-256 hash with a server-side pepper. Verified directly against the database.
- **Reliability**: rate limiting and logging are decoupled from the request path — logging failures can never break a live request.
- **Testing**: every layer (auth, rate limiting, logging, proxying) was tested end-to-end against a live external API before being committed.
- **CI/CD**: GitHub Actions runs a full build — including a live Postgres service, Prisma migrations, TypeScript type-checking, and a Docker build — on every push.
- **Project management**: development was tracked issue-by-issue on a [GitHub Project board](https://github.com/users/oyeniffy/projects/7), with a full closed-issue history matching the actual commit history.

## Project status

Actively built as a portfolio project — see the [systems design doc](ARCHITECTURE.md#whats-not-yet-built) for what's implemented versus the target production architecture.
