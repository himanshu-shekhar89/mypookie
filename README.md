# mypookie.

An interactive e-gifting platform where senders assemble messages, memories, games and surprises into one recipient-controlled experience.

## Applications

- `app/` — React/Next frontend and gift builder
- `backend/` — Spring Boot 3 / Java 21 REST API

## Local development

Frontend:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Backend:

```bash
cd backend
cp .env.example .env
mvn spring-boot:run
```

Without database environment variables the backend uses an in-memory H2 database in MySQL compatibility mode. Set `DATABASE_URL`, `DATABASE_USERNAME` and `DATABASE_PASSWORD` for MySQL.

The frontend uses `NEXT_PUBLIC_API_URL` and defaults to `http://localhost:8080`.

## Authentication

Development requests may use `X-Demo-User`. For production:

1. Create Firebase Google and Apple providers.
2. Set `FIREBASE_ENABLED=true`.
3. Provide `GOOGLE_APPLICATION_CREDENTIALS`.
4. Send the Firebase ID token as `Authorization: Bearer <token>`.

## Core API

- `GET /api/catalog`
- `POST /api/auth/session`
- `GET|POST /api/gifts`
- `PUT /api/gifts/{id}`
- `POST /api/gifts/{id}/publish`
- `GET /api/public/gifts/{shareToken}`
- `GET /api/health`

## Deployment

The frontend is deployable through Sites. The backend includes a production Dockerfile suitable for Railway, Render, Fly.io or another container host. Connect a MySQL database and configure the variables from `backend/.env.example`.
