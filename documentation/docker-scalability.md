# Docker Containerization & Scalability Guide

This document details how to run, scale, and manage the VoteChain platform using **Docker** and **Docker Compose**.

---

## 1. Containerization Architecture

VoteChain is containerized into four distinct container services:

```
                  ┌──────────────────────────────┐
                  │ Next.js Frontend (Port 3000) │
                  └──────────────┬───────────────┘
                                 │ HTTP requests
                                 ▼
                  ┌──────────────────────────────┐
                  │  Nginx Load Balancer (8080)  │
                  └──────────────┬───────────────┘
                                 │ Least-Connection Load Balancing
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
   │ Backend Node 1  │  │ Backend Node 2  │  │ Backend Node 3  │ ...
   └────────┬────────┘  └────────┬────────┘  └────────┬────────┘
            └────────────────────┼────────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ PostgreSQL 16 DB (Port 5432) │
                  └──────────────────────────────┘
```

| Service | Image / Base | Description |
| ------- | ------------ | ----------- |
| `postgres` | `postgres:16-alpine` | PostgreSQL 16 database with health check configuration. |
| `backend` | `node:20-alpine` | Express + Prisma API microservice (scalable to $N$ replicas). |
| `loadbalancer` | `nginx:alpine` | Nginx reverse proxy performing least-connection load balancing across `backend` replicas. |
| `frontend` | `node:20-alpine` | Next.js 15 production container running the web application. |

---

## 2. Docker Quickstart Commands

### Step 1: Build and Launch All Services
```bash
docker compose up --build -d
```

### Step 2: Run Database Migrations & Seed Data
Execute Prisma migrations and seed system accounts and 50 Mock Aadhaar citizens inside the containerized database:
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

---

## 3. Scaling the Backend API Layer

To demonstrate horizontal scalability under heavy voting load, scale the Express API layer to **3 parallel container replicas**:

```bash
# Scale backend service to 3 worker nodes
docker compose up --scale backend=3 -d
```

### Verify Active Instances
```bash
docker compose ps
```

You will observe 3 backend worker containers (`votechain-backend-1`, `votechain-backend-2`, `votechain-backend-3`) active simultaneously behind Nginx on port `8080`.

### Stream Live Logs Across Replicas
```bash
docker compose logs -f backend
```

---

## 4. Teardown & Clean Up

To stop all services and remove container volumes:
```bash
docker compose down -v
```

---

## 5. Port Reference & Environment Secrets

- **Frontend Application**: `http://localhost:3000`
- **Backend API & Nginx Proxy**: `http://localhost:8080/api/v1`
- **Health Check Endpoint**: `http://localhost:8080/api/v1/health`
- **PostgreSQL Database**: `localhost:5432` (`user: votechain_user`, `pass: votechain_secret_password`)
