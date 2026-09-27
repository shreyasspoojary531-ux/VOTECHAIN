# Deployment & Environments

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (local server or managed cluster)
- npm 10+

## Local development

```bash
# Database — create an empty database, e.g.
createdb votechain
# (or use the user-space PostgreSQL cluster described in database/)

# Backend
cd backend
npm install
cat > .env <<'EOF'
PORT=8080
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/votechain?schema=public
JWT_SECRET=<generate-a-strong-random-string>
JWT_EXPIRES_IN=1d
OTP_PEPPER=<another-strong-random-string>
CORS_ORIGIN=http://localhost:3000
EOF
npx prisma migrate dev
npx prisma db seed
npm run dev                 # http://localhost:8080/api/v1

# Frontend
cd frontend
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
npm run dev                 # http://localhost:3000
```

Smoke test: `curl http://localhost:8080/api/v1/health` → `{ "status": "ok" }`.

## Environment variables

Backend: see the table in [backend.md](backend.md). Frontend: `NEXT_PUBLIC_API_BASE_URL` only (see `frontend/.env.example`).

## Production build & run

```bash
# Backend
cd backend
npm run build               # compiles to dist/
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
npm run start               # or deploy to Vercel
```

### Production checklist

- [ ] Strong, unique `JWT_SECRET` and `OTP_PEPPER` (no dev fallbacks).
- [ ] `NODE_ENV=production` (this also disables `devOtp` exposure).
- [ ] `CORS_ORIGIN` set to the real frontend origin.
- [ ] `DATABASE_URL` points at a managed PostgreSQL with migrations applied (`npx prisma migrate deploy`).
- [ ] Rate limiting reviewed (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`).
- [ ] Process manager / service unit for the backend (systemd, PM2, etc.) behind a reverse proxy with TLS.
- [ ] Scheduled database backups.
- [ ] Review limitations.md before any real election use.

## Port notes

- The backend code defaults `PORT` to 5000; the local working configuration uses **8080** because the frontend calls `http://localhost:8080/api/v1`. Keep both sides consistent via `.env` / `NEXT_PUBLIC_API_BASE_URL`.
