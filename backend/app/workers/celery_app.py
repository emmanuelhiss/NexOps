from __future__ import annotations

from celery import Celery

from app.config import settings

celery_app = Celery(
    "nexops",
    broker=settings.celery_broker_url,
    backend=settings.celery_broker_url,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "sync-infrastructure": {
        "task": "app.workers.sync_infrastructure.sync_infrastructure",
        "schedule": 30.0,
    },
    "collect-metrics": {
        "task": "app.workers.collect_metrics.collect_metrics",
        "schedule": 30.0,
    },
    "health-check": {
        "task": "app.workers.health_checker.health_check",
        "schedule": 30.0,
    },
}

celery_app.conf.include = [
    "app.workers.sync_infrastructure",
    "app.workers.collect_metrics",
    "app.workers.health_checker",
]
