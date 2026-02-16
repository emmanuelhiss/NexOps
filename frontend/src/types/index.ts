export interface Meta {
  timestamp: string;
  total?: number;
  page?: number;
  per_page?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: Meta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface Node {
  id: string;
  hostname: string;
  ip_address: string;
  provider: string;
  status: "online" | "offline" | "maintenance";
  cpu_cores: number;
  memory_total_mb: number;
  disk_total_gb: number;
  proxmox_node_name: string | null;
  metadata: Record<string, unknown> | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VM {
  id: string;
  node_id: string;
  vmid: number;
  name: string;
  status: "running" | "stopped" | "paused" | "error";
  type: "qemu" | "lxc";
  cpu_cores: number;
  memory_mb: number;
  disk_gb: number;
  ip_address: string | null;
  os_type: string | null;
  tags: string[] | null;
  config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface VMMetrics {
  vmid: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_in: number;
  network_out: number;
  uptime: number;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  type: "vm" | "container" | "external";
  status: "healthy" | "unhealthy" | "degraded" | "unknown";
  health_check_url: string | null;
  vm_id: string | null;
  namespace: string | null;
  metadata: Record<string, unknown> | null;
  last_health_check: string | null;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: string;
  source_type: string;
  source_id: string;
  metric_name: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface MetricTimeSeries {
  metric_name: string;
  unit: string;
  data: Array<{ value: number; timestamp: string }>;
}

export interface ResourceOverview {
  total_nodes: number;
  total_vms: number;
  running_vms: number;
  active_alerts: number;
  avg_cpu_usage: number;
  avg_memory_usage: number;
  avg_disk_usage: number;
}

export interface Alert {
  id: string;
  rule_id: string;
  source_type: string;
  source_id: string;
  severity: "info" | "warning" | "critical";
  status: "firing" | "acknowledged" | "resolved";
  title: string;
  description: string | null;
  fired_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  metric_name: string;
  condition: "gt" | "lt" | "gte" | "lte" | "eq";
  threshold: number;
  duration_seconds: number;
  severity: "info" | "warning" | "critical";
  enabled: boolean;
  notification_channels: string[] | null;
  created_at: string;
  updated_at: string;
}
