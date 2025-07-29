# Full-Stack URL Shortener

This is a comprehensive, production-ready URL shortening service built as a full-stack application. It features a modern, scalable backend API and a responsive React frontend, all containerized with Docker for consistent development and deployment.

The project not only fulfills all core requirements but also implements a wide range of **Extra Credit** features to demonstrate best practices in performance, security, and professional software architecture.

---

## Features

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
- ✅ **URL Validation:** The backend validates that the provided string is a valid URL format.
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

---

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- pnpm
- Docker

---

### 1. Initial Setup

Clone the repository and install all dependencies for the monorepo with a single command from the project root:

```sh
pnpm run setup
```

---

### 2. Environment Variables

This project uses `.env` files for configuration.

```sh
cp .env.example .env.development
cp .env.example .env.production
```

Fill in the required values in both `.env.development` and `.env.production`.

---

## How to Run

You can run the application in two modes: **Development (hybrid)** or **Production (fully containerized)**.

---

### Development Mode

This mode is optimized for development. It runs the backend services (API, DB, Redis) in Docker and the Next.js frontend on your local machine for the best hot-reloading experience.

You can either start the backend and frontend separately in two terminals, or run everything together with a single command.

#### Option 1: Separate Terminals

**In Terminal 1 (Backend):**

```sh
# Starts the backend, database, and Redis containers
pnpm run dev:backend
```

**In Terminal 2 (Frontend):**

```sh
# Starts the Next.js development server locally
pnpm run dev:frontend
```

#### Option 2: All Together

```sh
# Starts both backend and frontend concurrently
pnpm dev
```

- Backend API: [http://localhost:3000](http://localhost:3000)
- Frontend App: [http://localhost:3001](http://localhost:3001)

To stop the development backend services, run:

```sh
pnpm run dev:down
```

---

### Production Mode

This mode builds and runs optimized, production-ready containers for the entire application stack (frontend, backend, db, redis).

To start all services:

```sh
# This command builds and starts all containers in the background (-d)
pnpm run prod:up
```

- Backend API: [http://localhost:3000](http://localhost:3000)
- Frontend App: [http://localhost:3001](http://localhost:3001)

To stop all production services:

```sh
pnpm run prod:down
```

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

1. Ensure the application is running (dev or prod mode).
2. From the project root, run:

    ```sh
    k6 run stress-test.js
    ```
