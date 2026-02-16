# CLAUDE.md — NexOps Phase 1: The Application

## Project Overview

NexOps is an open-source infrastructure management platform. It provides a single dashboard to deploy, manage, and monitor services running across a homelab (Proxmox), with future support for cloud providers (AWS/Azure).

This is Phase 1 — building the core application. The app will be containerized (Phase 2), orchestrated with K3s (Phase 4), and deployed via GitOps (Phase 6) in later phases. Build with that future in mind.

## Tech Stack

### Backend

- **Framework:** FastAPI (Python 3.12)
- **Package Manager:** uv (NOT pip, NOT poetry)
- **ORM:** SQLAlchemy 2.0 (async, using `asyncpg` driver)
- **Migrations:** Alembic
- **Database:** PostgreSQL 16
- **Cache/Queue:** Redis 7
- **Background Workers:** Celery with Redis broker
- **Validation:** Pydantic v2
- **External APIs:** `proxmoxer` for Proxmox API integration

### Frontend

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Package Manager:** pnpm
- **UI Library:** shadcn/ui (with Tailwind CSS v4)
- **Charts:** Recharts (comes with shadcn/ui charts)
- **Data Fetching:** SWR
- **Icons:** Lucide React

### Development

- **Database (dev):** PostgreSQL via Docker container
- **Cache (dev):** Redis via Docker container
- **API Docs:** Auto-generated Swagger at `/docs`

## Repository Structure

```
nexops/
├── CLAUDE.md
├── README.md
├── docker-compose.dev.yml        # Dev-only: PostgreSQL + Redis containers
├── backend/
│   ├── pyproject.toml            # uv project config
│   ├── uv.lock
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── config.py             # Settings via pydantic-settings
│   │   ├── database.py           # Async SQLAlchemy engine + session
│   │   ├── dependencies.py       # Dependency injection (db session, etc.)
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── router.py         # Main API router (aggregates all route modules)
│   │   │   ├── infrastructure.py # /api/v1/infrastructure/* routes
│   │   │   ├── services.py       # /api/v1/services/* routes
│   │   │   ├── metrics.py        # /api/v1/metrics/* routes
│   │   │   └── alerts.py         # /api/v1/alerts/* routes
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # SQLAlchemy declarative base
│   │   │   ├── node.py
│   │   │   ├── vm.py
│   │   │   ├── service.py
│   │   │   ├── metric.py
│   │   │   ├── alert.py
│   │   │   └── audit_log.py
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   │   ├── __init__.py
│   │   │   ├── infrastructure.py
│   │   │   ├── services.py
│   │   │   ├── metrics.py
│   │   │   └── alerts.py
│   │   ├── services/             # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── proxmox.py        # Proxmox API client wrapper
│   │   │   ├── infrastructure.py # Node/VM business logic
│   │   │   └── metrics.py        # Metrics collection logic
│   │   └── workers/              # Celery tasks
│   │       ├── __init__.py
│   │       ├── celery_app.py     # Celery application config
│   │       ├── collect_metrics.py
│   │       ├── health_checker.py
│   │       └── sync_infrastructure.py
│   └── tests/
│       ├── conftest.py
│       ├── test_infrastructure.py
│       └── test_services.py
├── frontend/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── components.json            # shadcn/ui config
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout with sidebar nav
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Dummy login page (no real auth)
│   │   │   ├── infrastructure/
│   │   │   │   ├── page.tsx       # Nodes + VMs list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Individual VM detail
│   │   │   ├── services/
│   │   │   │   ├── page.tsx       # Services list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Service detail
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx       # Alerts list
│   │   │   └── settings/
│   │   │       └── page.tsx       # Settings page
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components (auto-generated)
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   └── app-shell.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   ├── resource-gauges.tsx
│   │   │   │   ├── recent-alerts.tsx
│   │   │   │   └── vm-overview.tsx
│   │   │   ├── infrastructure/
│   │   │   │   ├── node-card.tsx
│   │   │   │   ├── vm-table.tsx
│   │   │   │   └── resource-chart.tsx
│   │   │   └── common/
│   │   │       ├── status-badge.tsx
│   │   │       └── loading-skeleton.tsx
│   │   ├── lib/
│   │   │   ├── api.ts             # API client (fetch wrapper)
│   │   │   ├── hooks/
│   │   │   │   ├── use-nodes.ts   # SWR hooks for data fetching
│   │   │   │   ├── use-vms.ts
│   │   │   │   ├── use-services.ts
│   │   │   │   └── use-metrics.ts
│   │   │   └── utils.ts           # Formatting, helpers
│   │   └── types/
│   │       └── index.ts           # TypeScript types matching backend schemas
│   └── public/
│       └── logo.svg
└── docs/
    ├── architecture.md
    └── adr/
        ├── 001-why-fastapi.md
        ├── 002-why-uv.md
        └── 003-why-shadcn.md
```

## Coding Standards

### Backend (Python)

- Use `async def` for ALL route handlers and database operations
- Use SQLAlchemy 2.0 style (mapped_column, DeclarativeBase) — NOT the legacy 1.x style
- All database models use UUID primary keys (use `uuid7` for time-sortable IDs)
- Separate concerns: routes → schemas → services → models (never put business logic in routes)
- Use Pydantic v2 `model_validator` and `field_validator`, NOT the v1 `@validator`
- Type hints on everything — no `Any` unless absolutely necessary
- Use `from __future__ import annotations` in every file
- Config via environment variables loaded through `pydantic-settings`
- All timestamps in UTC, stored as `datetime` with timezone
- Use Python `logging` module, structured JSON logs
- Docstrings on all public functions and classes
- Write tests using `pytest` + `pytest-asyncio` + `httpx.AsyncClient`

### Frontend (TypeScript)

- Use Next.js App Router (NOT Pages Router)
- All components are functional components with TypeScript
- Use `"use client"` directive only when necessary (client interactivity)
- Server components by default
- SWR for all API data fetching with proper error and loading states
- No inline styles — use Tailwind CSS utility classes only
- Extract reusable components — no component file over 200 lines
- Use TypeScript `interface` for object shapes, `type` for unions/intersections
- shadcn/ui components for all standard UI elements (buttons, cards, tables, dialogs, etc.)
- Use Recharts for all charts and graphs
- Responsive design — works on desktop and tablet

### General

- No hardcoded values — use environment variables or config files
- No `console.log` in production code (use proper logging)
- Meaningful variable/function names — no abbreviations
- Keep functions small and focused — one function, one job
- Handle errors explicitly — no bare `except:` in Python, always catch specific errors

## Phase 1 MVP Scope

### What to Build (in order)

#### Step 1: Project Scaffolding

- Initialize backend with uv, FastAPI, and folder structure
- Initialize frontend with Next.js, pnpm, shadcn/ui, Tailwind
- Create `docker-compose.dev.yml` with PostgreSQL 16 and Redis 7
- Create `.env.example` with all required environment variables
- Verify both backend and frontend start and serve basic responses

#### Step 2: Database Models + Migrations

- Create all SQLAlchemy models (Node, VM, Service, Metric, Alert, AlertRule, AuditLog)
- Set up Alembic with async support
- Generate and run initial migration
- Create seed data script for development

#### Step 3: Infrastructure API (Proxmox Integration)

- Build Proxmox API client wrapper using `proxmoxer`
- Implement endpoints:
  - `GET /api/v1/infrastructure/nodes` — list Proxmox nodes with CPU, memory, disk, uptime
  - `GET /api/v1/infrastructure/vms` — list all VMs with status, resource allocation
  - `GET /api/v1/infrastructure/vms/{vmid}` — single VM details
  - `GET /api/v1/infrastructure/vms/{vmid}/metrics` — current resource usage (CPU %, memory %, disk %, network)
  - `POST /api/v1/infrastructure/vms/{vmid}/start` — start a VM
  - `POST /api/v1/infrastructure/vms/{vmid}/stop` — stop a VM
  - `POST /api/v1/infrastructure/vms/{vmid}/restart` — restart a VM
- Handle Proxmox connection failures gracefully (timeouts, auth errors)
- Cache Proxmox responses in Redis (TTL: 30 seconds for metrics, 5 minutes for VM list)

#### Step 4: Services API

- Implement CRUD endpoints for managed services:
  - `GET /api/v1/services`
  - `GET /api/v1/services/{id}`
  - `POST /api/v1/services`
  - `PUT /api/v1/services/{id}`
  - `DELETE /api/v1/services/{id}`
- Services represent any managed application (can be a VM, container, or external service)
- Include health check URL field — backend periodically pings it

#### Step 5: Metrics + Alerts API

- Implement metrics storage and retrieval:
  - `GET /api/v1/metrics/overview` — aggregate health across all services
  - `GET /api/v1/metrics/{service_id}?range=1h|6h|24h|7d` — time-series metrics for a service
- Implement alerts:
  - `GET /api/v1/alerts` — list active and historical alerts
  - `POST /api/v1/alerts/rules` — create alert rules (e.g., "alert if CPU > 90%")
  - `PUT /api/v1/alerts/rules/{id}` — update a rule
  - `DELETE /api/v1/alerts/rules/{id}` — delete a rule

#### Step 6: Background Workers (Celery)

- Set up Celery with Redis broker
- `sync_infrastructure` task — every 5 minutes, pull node/VM data from Proxmox, update database
- `collect_metrics` task — every 30 seconds, pull CPU/memory/disk/network from Proxmox API for each VM, store as Metric records
- `health_checker` task — every 30 seconds, ping health_check_url for each registered service, update status

#### Step 7: Frontend — Layout + Dashboard

- App shell: sidebar navigation, header with user avatar placeholder
- Sidebar links: Dashboard, Infrastructure, Services, Alerts, Settings
- Dashboard page (`/`):
  - Stats cards: total nodes, total VMs, running VMs, active alerts count
  - Resource usage gauges (cluster-wide CPU, memory, disk)
  - Recent alerts feed (last 10)
  - VM overview table (top 5 by resource usage)
- All data fetched via SWR from backend API
- Loading skeletons while data loads
- Error states when API is unreachable

#### Step 8: Frontend — Infrastructure Page

- `/infrastructure` page:
  - Node cards showing hostname, IP, CPU/memory/disk usage bars, uptime
  - VM table with columns: name, status, CPU, memory, disk, IP, actions
  - Status badges (running = green, stopped = gray, error = red)
  - Action buttons: start, stop, restart (call backend API)
- `/infrastructure/[vmid]` page:
  - VM detail with current metrics
  - Resource usage charts (CPU, memory over time using Recharts)
  - VM configuration details

#### Step 9: Frontend — Services + Alerts Pages

- `/services` page: table of registered services with health status
- `/services/[id]` page: service detail with metrics charts
- `/alerts` page: active alerts, alert history, alert rule management

#### Step 10: Frontend — Login + Settings

- `/login` page: simple login form (email + password fields, no real auth — just redirects to dashboard)
- `/settings` page: Proxmox connection settings form, notification preferences placeholder

### What NOT to Build Yet

- Real authentication/authorization (Phase 9 — Security)
- Kubernetes integration (Phase 4 — K3s not deployed yet)
- Prometheus/Grafana integration (Phase 7 — Monitoring stack not deployed yet)
- AI assistant / RAG pipeline (Phase 8)
- Deployment management (Phase 5/6 — CI/CD + ArgoCD)
- VM provisioning / creation (Phase 3 — Terraform)
- WebSocket real-time updates (nice to have, add later)

## Database Schema

### Node

| Column            | Type         | Notes                              |
| ----------------- | ------------ | ---------------------------------- |
| id                | UUID (PK)    | uuid7                              |
| hostname          | VARCHAR(255) | unique                             |
| ip_address        | VARCHAR(45)  |                                    |
| provider          | VARCHAR(50)  | "proxmox", "aws", "azure"          |
| status            | VARCHAR(20)  | "online", "offline", "maintenance" |
| cpu_cores         | INTEGER      | total cores                        |
| memory_total_mb   | INTEGER      | total RAM in MB                    |
| disk_total_gb     | INTEGER      | total disk in GB                   |
| proxmox_node_name | VARCHAR(255) | Proxmox internal name              |
| metadata          | JSONB        | extra provider-specific data       |
| last_seen_at      | TIMESTAMPTZ  | last successful poll               |
| created_at        | TIMESTAMPTZ  |                                    |
| updated_at        | TIMESTAMPTZ  |                                    |

### VM

| Column     | Type             | Notes                                   |
| ---------- | ---------------- | --------------------------------------- |
| id         | UUID (PK)        | uuid7                                   |
| node_id    | UUID (FK → Node) |                                         |
| vmid       | INTEGER          | Proxmox VMID                            |
| name       | VARCHAR(255)     |                                         |
| status     | VARCHAR(20)      | "running", "stopped", "paused", "error" |
| type       | VARCHAR(20)      | "qemu", "lxc"                           |
| cpu_cores  | INTEGER          | allocated cores                         |
| memory_mb  | INTEGER          | allocated RAM                           |
| disk_gb    | FLOAT            | allocated disk                          |
| ip_address | VARCHAR(45)      | nullable                                |
| os_type    | VARCHAR(100)     | e.g., "ubuntu-24.04"                    |
| tags       | ARRAY(VARCHAR)   | Proxmox tags                            |
| config     | JSONB            | full Proxmox config snapshot            |
| created_at | TIMESTAMPTZ      |                                         |
| updated_at | TIMESTAMPTZ      |                                         |

### Service

| Column            | Type           | Notes                                         |
| ----------------- | -------------- | --------------------------------------------- |
| id                | UUID (PK)      | uuid7                                         |
| name              | VARCHAR(255)   | unique                                        |
| description       | TEXT           |                                               |
| type              | VARCHAR(50)    | "vm", "container", "external"                 |
| status            | VARCHAR(20)    | "healthy", "unhealthy", "degraded", "unknown" |
| health_check_url  | VARCHAR(500)   | URL to ping for health                        |
| vm_id             | UUID (FK → VM) | nullable, links to VM if applicable           |
| namespace         | VARCHAR(100)   | for future K8s namespace                      |
| metadata          | JSONB          |                                               |
| last_health_check | TIMESTAMPTZ    |                                               |
| created_at        | TIMESTAMPTZ    |                                               |
| updated_at        | TIMESTAMPTZ    |                                               |

### Metric

| Column      | Type             | Notes                                                                  |
| ----------- | ---------------- | ---------------------------------------------------------------------- |
| id          | UUID (PK)        | uuid7                                                                  |
| source_type | VARCHAR(20)      | "node", "vm", "service"                                                |
| source_id   | UUID             | polymorphic FK                                                         |
| metric_name | VARCHAR(100)     | "cpu_usage", "memory_usage", "disk_usage", "network_in", "network_out" |
| value       | DOUBLE PRECISION |                                                                        |
| unit        | VARCHAR(20)      | "percent", "bytes", "bytes_per_sec"                                    |
| timestamp   | TIMESTAMPTZ      | when metric was collected                                              |

Index on (source_type, source_id, metric_name, timestamp DESC) for fast time-series queries.

### Alert

| Column          | Type                  | Notes                                |
| --------------- | --------------------- | ------------------------------------ |
| id              | UUID (PK)             | uuid7                                |
| rule_id         | UUID (FK → AlertRule) |                                      |
| source_type     | VARCHAR(20)           | "node", "vm", "service"              |
| source_id       | UUID                  |                                      |
| severity        | VARCHAR(20)           | "info", "warning", "critical"        |
| status          | VARCHAR(20)           | "firing", "acknowledged", "resolved" |
| title           | VARCHAR(255)          | human-readable alert title           |
| description     | TEXT                  | details                              |
| fired_at        | TIMESTAMPTZ           |                                      |
| acknowledged_at | TIMESTAMPTZ           | nullable                             |
| resolved_at     | TIMESTAMPTZ           | nullable                             |

### AlertRule

| Column                | Type             | Notes                                         |
| --------------------- | ---------------- | --------------------------------------------- |
| id                    | UUID (PK)        | uuid7                                         |
| name                  | VARCHAR(255)     |                                               |
| description           | TEXT             |                                               |
| metric_name           | VARCHAR(100)     | which metric to watch                         |
| condition             | VARCHAR(20)      | "gt", "lt", "gte", "lte", "eq"                |
| threshold             | DOUBLE PRECISION |                                               |
| duration_seconds      | INTEGER          | how long condition must be true before firing |
| severity              | VARCHAR(20)      |                                               |
| enabled               | BOOLEAN          | default true                                  |
| notification_channels | ARRAY(VARCHAR)   | "discord", "slack", "email"                   |
| created_at            | TIMESTAMPTZ      |                                               |
| updated_at            | TIMESTAMPTZ      |                                               |

### AuditLog

| Column        | Type         | Notes                                         |
| ------------- | ------------ | --------------------------------------------- |
| id            | UUID (PK)    | uuid7                                         |
| actor         | VARCHAR(255) | who did the action                            |
| action        | VARCHAR(100) | "vm.start", "vm.stop", "service.create", etc. |
| resource_type | VARCHAR(50)  | "vm", "service", "alert_rule"                 |
| resource_id   | UUID         |                                               |
| details       | JSONB        | action-specific context                       |
| ip_address    | VARCHAR(45)  | request IP                                    |
| timestamp     | TIMESTAMPTZ  |                                               |

## Environment Variables

```env
# Backend
DATABASE_URL=postgresql+asyncpg://nexops:nexops@localhost:5432/nexops
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1

# Proxmox
PROXMOX_HOST=192.168.4.93
PROXMOX_PORT=8006
PROXMOX_USER=nexops@pve
PROXMOX_TOKEN_NAME=nexops
PROXMOX_TOKEN_VALUE=135dd265-b704-440c-97f1-a0c428434e36
PROXMOX_VERIFY_SSL=false

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# General
ENVIRONMENT=development
LOG_LEVEL=INFO
```

## UI Design Direction

### Overall Aesthetic

- **Dark theme by default** — this is a DevOps/infrastructure tool, dark mode is expected
- **Clean, utilitarian, data-dense** — inspired by Grafana, Datadog, Vercel dashboard
- **Color palette:**
  - Background: deep navy/charcoal (not pure black)
  - Cards/surfaces: slightly lighter shade with subtle border
  - Primary accent: electric blue or cyan (for interactive elements)
  - Success: green
  - Warning: amber/orange
  - Error: red
  - Text: white/light gray hierarchy
- **Typography:** Use a clean monospace for metrics/data values (JetBrains Mono or similar), clean sans-serif for UI text
- **Spacing:** Consistent, generous padding — don't cram things together
- **Charts:** Use consistent color scheme across all Recharts visualizations

### Dashboard Layout

- Fixed sidebar (collapsible) on the left
- Main content area with responsive grid
- Stats cards at the top, charts below, tables at the bottom
- Subtle animations on data load (fade in, not flashy)

## API Response Format

All API responses follow this structure:

```json
// Success (single item)
{
  "data": { ... },
  "meta": { "timestamp": "2024-03-15T10:30:00Z" }
}

// Success (list)
{
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "per_page": 20,
    "timestamp": "2024-03-15T10:30:00Z"
  }
}

// Error
{
  "error": {
    "code": "NOT_FOUND",
    "message": "VM with id '...' not found"
  }
}
```

## How to Run (Development)

```bash
# 1. Start dev dependencies
docker compose -f docker-compose.dev.yml up -d

# 2. Backend
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000

# 3. Frontend
cd frontend
pnpm install
pnpm dev
```

## Important Notes

- The Proxmox server is at 192.168.4.93:8006 — connection details will be in env vars
- The app runs on the developer's local machine for now, NOT inside Proxmox VMs (that comes in Phase 2+)
- Don't over-engineer auth — a dummy login page that sets a cookie and redirects is fine
- Focus on real Proxmox data first — the infrastructure pages should show REAL VMs and metrics from the actual Proxmox server
- Every API endpoint should have proper error handling and return meaningful error messages
- The Celery workers should gracefully handle Proxmox being unreachable (log the error, retry later, don't crash)
