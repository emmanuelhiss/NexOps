"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import type { Alert, ApiResponse } from "@/types";

const severityBorder: Record<string, string> = {
  critical: "border-l-destructive",
  warning: "border-l-warning",
  info: "border-l-primary",
};

export function RecentAlerts() {
  const { data, isLoading, error } = useSWR<ApiResponse<Alert[]>>(
    "/api/v1/alerts?status=firing",
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: false }
  );

  const alerts = data?.data?.slice(0, 10) ?? [];

  if (isLoading) {
    return (
      <Card className="card-content">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={5} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-content">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive py-8 text-center">
            Failed to load alerts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-content">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No active alerts
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between rounded-md border-l-[3px] border border-white/[0.04] bg-white/[0.02] px-4 py-3 ${
                  severityBorder[alert.severity] ?? "border-l-muted"
                }`}
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {new Date(alert.fired_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={alert.severity} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
