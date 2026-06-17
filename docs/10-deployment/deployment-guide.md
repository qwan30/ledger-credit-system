# Deployment Guide

## Local Development Runtime

```powershell
npm ci
docker compose up -d postgres
Copy-Item .env.example .env
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:seed
npm run start:dev
```

## Local URLs

| Purpose | URL |
|---|---|
| Liveness | `http://localhost:3000/api/v1/health/live` |
| Readiness | `http://localhost:3000/api/v1/health/ready` |
| Swagger | `http://localhost:3000/docs` |

## Current Deployment Evidence

The repository contains a backend `Dockerfile`, local PostgreSQL `docker-compose.yml`, and CI workflow. It does not currently contain an automated delivery workflow or deployment target proof.

## Release Hardening Notes

- Replace demo secrets.
- Restrict CORS origins.
- Align CI Node 22 and Dockerfile Node 20 or document tested compatibility.
- Record verification results before assigning any stronger release label.
