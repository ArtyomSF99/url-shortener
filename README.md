# URL Shortener Project

A full-stack URL shortener application using Next.js (frontend), Node.js (backend), PostgreSQL, and Redis. Supports both development and production environments with Docker Compose.

---

## Deployments

The application demo is deployed and available at:

- **Production:** [https://app.sfreedom.net](https://app.sfreedom.net)

---

## Features

- Shorten URLs with analytics
- RESTful API backend (Node.js)
- Modern frontend (Next.js)
- PostgreSQL for persistent storage
- Redis for caching
- JWT authentication
- Dockerized for easy deployment

### Core Requirements

- **URL Shortening:** Create a unique, short slug for any given long URL.
- **Database Integration:** All shortened URLs are saved to a PostgreSQL database.
- **Unique Slugs:** The system guarantees that every generated or custom slug is unique.
- **Redirection:** Accessing a short URL correctly redirects to the original long URL.
- **404 Handling:** Accessing an invalid or non-existent slug displays a "Not Found" message.
- **URL Listing:** A page to view created URLs.

### Implemented "Extra Credit" Features

- ✅ **User Accounts:** Full user registration and login system using JWT for authentication.
- ✅ **User-Specific URLs:** Users can only view and manage the URLs they have created.
- ✅ **URL Validation:** The backend ensures that any submitted URL is properly formatted and valid before shortening.
- ✅ **Copy to Clipboard:** A user-friendly button to easily copy the shortened URL.
- ✅ **Custom Slug Editing:** Logged-in users can edit the slug of their own links.
- ✅ **Visit Tracking:** The system tracks the number of visits for each shortened URL.
- ✅ **Rate Limiting:** The API is protected against abuse and brute-force attacks with a global rate limiter.
- ✅ **Dockerized Application:** The entire stack (backend, frontend, database, cache) is fully containerized with Docker and managed via Docker Compose.
- ✅ **Separate Dev/Prod Environments:** Distinct configurations for development (with hot-reloading) and optimized production builds.
- ✅ **Performance Optimized:**
  - **Asynchronous Registration:** Heavy CPU-bound registration logic is moved to a background queue (BullMQ) to keep the API responsive under load.
  - **Redis Caching:** The redirect endpoint is heavily cached with Redis to ensure near-instantaneous performance for high-traffic links.
  - **Worker Threads:** CPU-intensive password comparison during login is offloaded to a separate worker thread to prevent blocking the main event loop.

---

## Tech Stack

- **Backend:** Node.js, NestJS, TypeScript, TypeORM, PostgreSQL, Redis, BullMQ
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **DevOps & Tooling:** Docker, Docker Compose, pnpm (Workspaces), k6 (for stress testing)

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

- `.env.example` documents all required variables for both development and production.
- **Never commit your real `.env` files.**

---

## Development

Start backend, database, and Redis for development:

```bash
docker compose -f docker-compose.dev.yml up --build
```
or 
```bash
pnpm dev
```

- Backend: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

> The frontend is not included in the dev compose file. Run it locally with `npm run dev` or similar inside `apps/frontend`.

---

## Production

Build and run the full stack (frontend, backend, db, redis):

```bash
docker compose -f docker-compose.prod.yml up --build
```
or
```bash
pnpm prod:up
```

- Frontend: http://localhost:3002
- Backend: http://localhost:3001

---

## File Structure

- `apps/frontend` - Next.js frontend
- `apps/backend` - Node.js backend
- `docker-compose.dev.yml` - Dev services (backend, db, redis)
- `docker-compose.prod.yml` - Production stack (frontend, backend, db, redis)
- `.env.example` - Example environment variables

---

## Data Persistence

- PostgreSQL and Redis data are persisted in Docker volumes:
  - Dev: `postgres_data_dev`, `redis_data_dev`
  - Prod: `postgres_data_prod`, `redis_data_prod`

---

## Healthchecks

- Production services use healthchecks for `db` and `redis` to ensure backend waits for dependencies.

---

## Useful Commands

- **Stop all containers:**  
  `docker compose -f docker-compose.dev.yml down` or `pnpm dev:down`  
  `docker compose -f docker-compose.prod.yml down` or `pnpm prod:down`
- **Remove volumes:**  
  Add `-v` to the above commands.

---

## Notes

- Update `NEXT_PUBLIC_API_URL` and other URLs in your `.env` as needed.
- For production, ensure you set secure values for secrets.

---

## Database Migrations

Database schema changes are managed via TypeORM migrations. These commands should be run from your local machine while the development containers are running.

**Generate a new migration:**

After making changes to your entities, create a new migration file.

```sh
pnpm run migration:generate src/migrations/YourMigrationName
```

**Run pending migrations:**

This applies all un-run migrations to the database.

```sh
pnpm run migration:run
```

**Revert the last migration:**

```sh
pnpm run migration:revert
```

---

## Testing

This project includes both unit tests for business logic and scripts for performance load testing.

### Unit Tests (Backend)

The backend provides unit tests for core services such as `AuthService` and `UrlService`, written with [Jest](https://jestjs.io/). These tests isolate business logic by mocking dependencies like databases and external APIs.

To run all backend unit tests:

```sh
cd apps/backend
pnpm test
```
---

## Performance & Scalability

Extensive load testing was performed using **k6**, simulating up to **1000 concurrent users** to assess system performance.

- **Initial Findings:**  
    - Registration and login APIs exhibited critical bottlenecks.
    - Response times exceeded **12 seconds**.
    - Failure rates reached **25%** due to event loop blocking.

- **Optimizations Implemented:**  
    - **Asynchronous Registration:** Heavy registration logic moved to a BullMQ queue for background processing.
    - **Redis Caching:** Redirect logic leverages Redis for rapid reads.
    - **Worker Threads:** Password comparison (bcrypt) offloaded to a worker thread, preventing main thread blocking during login.

- **Final Results (Post-Optimization, 1000 virtual users):**  
    - **Failure Rate:** 0.00% (fully stable)
    - **Registration Response Time (avg):** ~5 ms
    - **Redirect Response Time (avg):** ~60 ms

**Conclusion:**  
The application is stable under heavy load and designed for scalability.

---
## Stress Testing

A stress test script is included in the project.

> **Note:** [k6](https://k6.io/) must be installed on your system to run the stress tests.  
> You can install it by following the [official installation guide](https://k6.io/docs/getting-started/installation/).

1. Ensure the application is running (dev or prod mode with disabled Rate Limitter).
2. From the project root, run:

    ```sh
    k6 run stress-test.js
    ```

---
