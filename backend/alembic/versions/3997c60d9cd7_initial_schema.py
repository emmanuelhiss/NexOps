"""initial schema

Revision ID: 3997c60d9cd7
Revises:
Create Date: 2026-02-16 15:44:50.792118

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "3997c60d9cd7"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "nodes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("hostname", sa.String(255), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=False),
        sa.Column("provider", sa.String(50), nullable=False, server_default="proxmox"),
        sa.Column("status", sa.String(20), nullable=False, server_default="online"),
        sa.Column("cpu_cores", sa.Integer(), nullable=False),
        sa.Column("memory_total_mb", sa.Integer(), nullable=False),
        sa.Column("disk_total_gb", sa.Integer(), nullable=False),
        sa.Column("proxmox_node_name", sa.String(255), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("hostname"),
    )
    op.create_index("ix_nodes_hostname", "nodes", ["hostname"])

    op.create_table(
        "vms",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("node_id", sa.Uuid(), nullable=False),
        sa.Column("vmid", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="stopped"),
        sa.Column("type", sa.String(20), nullable=False, server_default="qemu"),
        sa.Column("cpu_cores", sa.Integer(), nullable=False),
        sa.Column("memory_mb", sa.Integer(), nullable=False),
        sa.Column("disk_gb", sa.Float(), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("os_type", sa.String(100), nullable=True),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("config", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["node_id"], ["nodes.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "services",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type", sa.String(50), nullable=False, server_default="vm"),
        sa.Column("status", sa.String(20), nullable=False, server_default="unknown"),
        sa.Column("health_check_url", sa.String(500), nullable=True),
        sa.Column("vm_id", sa.Uuid(), nullable=True),
        sa.Column("namespace", sa.String(100), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
        sa.Column("last_health_check", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.ForeignKeyConstraint(["vm_id"], ["vms.id"], ondelete="SET NULL"),
    )

    op.create_table(
        "metrics",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("source_type", sa.String(20), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=False),
        sa.Column("metric_name", sa.String(100), nullable=False),
        sa.Column("value", sa.Double(), nullable=False),
        sa.Column("unit", sa.String(20), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_metrics_source_time",
        "metrics",
        ["source_type", "source_id", "metric_name", "timestamp"],
    )

    op.create_table(
        "alert_rules",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("metric_name", sa.String(100), nullable=False),
        sa.Column("condition", sa.String(20), nullable=False),
        sa.Column("threshold", sa.Double(), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("severity", sa.String(20), nullable=False, server_default="warning"),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("notification_channels", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("rule_id", sa.Uuid(), nullable=False),
        sa.Column("source_type", sa.String(20), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="firing"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("fired_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["rule_id"], ["alert_rules.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("actor", sa.String(255), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(50), nullable=False),
        sa.Column("resource_id", sa.Uuid(), nullable=False),
        sa.Column("details", postgresql.JSONB(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("alerts")
    op.drop_table("alert_rules")
    op.drop_index("ix_metrics_source_time", table_name="metrics")
    op.drop_table("metrics")
    op.drop_table("services")
    op.drop_table("vms")
    op.drop_index("ix_nodes_hostname", table_name="nodes")
    op.drop_table("nodes")
