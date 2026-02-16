# NexOps

Open-source infrastructure management platform. A single dashboard to deploy, manage, and monitor services running across a Proxmox homelab — with future support for cloud providers.

![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-dc382d?logo=redis&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

## What It Does

- **Node & VM Management** — View Proxmox nodes with real-time CPU, memory, and disk usage. Start, stop, and restart VMs directly from the dashboard.
- **Service Registry** — Track managed services with health check URLs. Background workers ping them every 30 seconds and update status automatically.
- **Metrics Collection** — Celery workers pull resource metrics from Proxmox every 30 seconds and store time-series data for historical charts.
- **Alert Rules** — Define threshold-based rules (e.g., "alert if CPU > 90%") with configurable severity and notification channels.
- **Dark Dashboard UI** — Premium dark theme with layered card depth, gradient progress bars, sparkline charts, and status indicators.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, Celery |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Recharts, SWR |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis 7 |
| **Integration** | Proxmox VE via `proxmoxer` |
| **Package Managers** | `uv` (Python), `pnpm` (Node) |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16
- Redis 7
- A Proxmox VE server (for live data)

### 1. Clone and configure

```bash
git clone https://github.com/emmanuelhiss/NexOps.git
cd NexOps
cp .env.example .env
# Edit .env with your Proxmox credentials and database connection
```

### 2. Start dependencies

```bash
docker compose -f docker-compose.dev.yml up -d
```

Or use existing PostgreSQL/Redis services — just update `.env`.

### 3. Backend

```bash
cd backend
uv sync
PYTHONPATH=. uv run alembic upgrade head
PYTHONPATH=. uv run uvicorn app.main:app --reload --port 8000
```

API docs available at [localhost:8000/docs](http://localhost:8000/docs).

### 4. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Dashboard at [localhost:3000](http://localhost:3000).

### 5. Background Workers

```bash
cd backend
PYTHONPATH=. uv run celery -A app.workers.celery_app worker --beat -l info
```

Workers handle:
- **sync_infrastructure** — Pulls node/VM data from Proxmox every 5 minutes
- **collect_metrics** — Collects CPU/memory/disk/network per VM every 30 seconds
- **health_checker** — Pings service health check URLs every 30 seconds

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Infrastructure

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/infrastructure/nodes` | List all Proxmox nodes |
| `GET` | `/infrastructure/vms` | List all VMs (filter by `?node_id=`) |
| `GET` | `/infrastructure/vms/{id}` | Get VM details |
| `GET` | `/infrastructure/vms/{id}/metrics` | Current VM resource metrics |
| `POST` | `/infrastructure/vms/{id}/start` | Start a VM |
| `POST` | `/infrastructure/vms/{id}/stop` | Stop a VM |
| `POST` | `/infrastructure/vms/{id}/restart` | Restart a VM |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/services` | List all services |
| `GET` | `/services/{id}` | Get service details |
| `POST` | `/services` | Create a service |
| `PUT` | `/services/{id}` | Update a service |
| `DELETE` | `/services/{id}` | Delete a service |

### Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/metrics/overview` | Cluster-wide resource overview |
| `GET` | `/metrics/{source_id}?range=1h` | Time-series metrics (1h, 6h, 24h, 7d) |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/alerts` | List alerts (filter by `?status=`) |
| `GET` | `/alerts/rules` | List alert rules |
| `POST` | `/alerts/rules` | Create an alert rule |
| `PUT` | `/alerts/rules/{id}` | Update an alert rule |
| `DELETE` | `/alerts/rules/{id}` | Delete an alert rule |

## Project Structure

```
NexOps/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI route handlers
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic + Proxmox client
│   │   └── workers/        # Celery background tasks
│   ├── alembic/            # Database migrations
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── app/            # Next.js pages (App Router)
│       ├── components/     # React components
│       ├── lib/            # API client, SWR hooks, utilities
│       └── types/          # TypeScript type definitions
└── docker-compose.dev.yml
```

## Roadmap

This is **Phase 1** of a larger project:

- [x] Phase 1 — Core application (FastAPI + Next.js + Proxmox)
- [ ] Phase 2 — Containerization (Docker)
- [ ] Phase 3 — Infrastructure as Code (Terraform)
- [ ] Phase 4 — Orchestration (K3s)
- [ ] Phase 5 — CI/CD pipeline
- [ ] Phase 6 — GitOps (ArgoCD)
- [ ] Phase 7 — Monitoring stack (Prometheus/Grafana)
- [ ] Phase 8 — AI assistant
- [ ] Phase 9 — Authentication & security hardening

## License

MIT
