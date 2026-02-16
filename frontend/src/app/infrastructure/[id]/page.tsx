"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Play, Square, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ResourceChart } from "@/components/infrastructure/resource-chart";
import { useVM, useVMMetrics, controlVM } from "@/lib/hooks/use-vms";

export default function VMDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { vm, isLoading, mutate } = useVM(id);
  const { metrics } = useVMMetrics(id);

  async function handleAction(action: "start" | "stop" | "restart") {
    await controlVM(id, action);
    mutate();
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!vm) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/infrastructure">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{vm.name}</h1>
          <p className="text-sm text-muted-foreground font-mono">
            VMID: {vm.vmid} | {vm.type.toUpperCase()}
          </p>
        </div>
        <StatusBadge status={vm.status} />
        <div className="flex gap-2">
          {vm.status !== "running" && (
            <Button
              size="sm"
              variant="outline"
              className="text-success border-success/30"
              onClick={() => handleAction("start")}
            >
              <Play className="mr-1 size-3.5" /> Start
            </Button>
          )}
          {vm.status === "running" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction("restart")}
              >
                <RotateCw className="mr-1 size-3.5" /> Restart
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30"
                onClick={() => handleAction("stop")}
              >
                <Square className="mr-1 size-3.5" /> Stop
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {metrics?.cpu_usage?.toFixed(1) ?? "-"}%
            </p>
            <p className="text-xs text-muted-foreground">{vm.cpu_cores} cores allocated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {metrics?.memory_usage?.toFixed(1) ?? "-"}%
            </p>
            <p className="text-xs text-muted-foreground">
              {(vm.memory_mb / 1024).toFixed(1)} GB allocated
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
              {metrics?.disk_usage?.toFixed(1) ?? "-"}%
            </p>
            <p className="text-xs text-muted-foreground">{vm.disk_gb.toFixed(1)} GB allocated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-mono">
              <span className="text-success">IN:</span>{" "}
              {metrics ? formatBytes(metrics.network_in) : "-"}
            </p>
            <p className="text-sm font-mono">
              <span className="text-warning">OUT:</span>{" "}
              {metrics ? formatBytes(metrics.network_out) : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">IP Address</span>
              <span className="font-mono">{vm.ip_address ?? "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">OS Type</span>
              <span className="font-mono">{vm.os_type ?? "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Type</span>
              <span className="font-mono">{vm.type}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Tags</span>
              <span className="font-mono">{vm.tags?.join(", ") ?? "None"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResourceChart sourceId={id} />
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
