"use client";

import useSWR from "swr";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { fetcher } from "@/lib/api";
import type { Alert, AlertRule, ApiResponse } from "@/types";

const severityLeftBorder: Record<string, string> = {
  critical: "border-l-[3px] border-l-destructive",
  warning: "border-l-[3px] border-l-warning",
  info: "border-l-[3px] border-l-primary",
};

export default function AlertsPage() {
  const { data: alertsData, isLoading: alertsLoading } = useSWR<
    ApiResponse<Alert[]>
  >("/api/v1/alerts", fetcher, { refreshInterval: 30000 });

  const { data: rulesData, isLoading: rulesLoading } = useSWR<
    ApiResponse<AlertRule[]>
  >("/api/v1/alerts/rules", fetcher);

  const alerts = alertsData?.data ?? [];
  const rules = rulesData?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {alertsLoading ? (
            <Card>
              <CardContent className="p-6">
                <TableSkeleton rows={5} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Title</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Severity</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Status</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Fired At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.filter((a) => a.status === "firing").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No active alerts
                        </TableCell>
                      </TableRow>
                    ) : (
                      alerts
                        .filter((a) => a.status === "firing")
                        .map((alert) => (
                          <TableRow
                            key={alert.id}
                            className={`hover:bg-elevated/50 transition-colors ${
                              severityLeftBorder[alert.severity] ?? ""
                            }`}
                          >
                            <TableCell>
                              <p className="font-medium">{alert.title}</p>
                              {alert.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {alert.description}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={alert.severity} />
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={alert.status} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              {new Date(alert.fired_at).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Title</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Severity</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Status</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Fired At</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Resolved At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No alert history
                      </TableCell>
                    </TableRow>
                  ) : (
                    alerts.map((alert) => (
                      <TableRow
                        key={alert.id}
                        className={`hover:bg-elevated/50 transition-colors ${
                          severityLeftBorder[alert.severity] ?? ""
                        }`}
                      >
                        <TableCell className="font-medium">{alert.title}</TableCell>
                        <TableCell>
                          <StatusBadge status={alert.severity} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={alert.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {new Date(alert.fired_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {alert.resolved_at
                            ? new Date(alert.resolved_at).toLocaleString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          {rulesLoading ? (
            <Card>
              <CardContent className="p-6">
                <TableSkeleton rows={4} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Name</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Metric</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Condition</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Severity</TableHead>
                      <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Enabled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No alert rules configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      rules.map((rule) => (
                        <TableRow key={rule.id} className="hover:bg-elevated/50 transition-colors">
                          <TableCell>
                            <p className="font-medium">{rule.name}</p>
                            {rule.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {rule.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {rule.metric_name}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {rule.condition} {rule.threshold}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={rule.severity} />
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center gap-1.5 text-sm ${
                                rule.enabled ? "text-success" : "text-muted-foreground"
                              }`}
                            >
                              <span className={`size-1.5 rounded-full ${
                                rule.enabled ? "bg-success" : "bg-muted-foreground"
                              }`} />
                              {rule.enabled ? "Active" : "Disabled"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
