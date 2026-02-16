"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/common/loading-skeleton";
import { useMetricsOverview } from "@/lib/hooks/use-metrics";

function GaugeBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-mono font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/[0.04]">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
        />
      </div>
    </div>
  );
}

export function ResourceGauges() {
  const { overview, isLoading, error } = useMetricsOverview();

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <Card className="card-content">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cluster Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive py-4 text-center">
            Failed to load resource data
          </p>
        </CardContent>
      </Card>
    );
  }

  const gauges = [
    { label: "CPU", value: overview?.avg_cpu_usage ?? 0, color: "#3b82f6" },
    { label: "Memory", value: overview?.avg_memory_usage ?? 0, color: "#8b5cf6" },
    { label: "Disk", value: overview?.avg_disk_usage ?? 0, color: "#06b6d4" },
  ];

  return (
    <Card className="card-content">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Cluster Resource Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {gauges.map((gauge) => (
          <GaugeBar key={gauge.label} {...gauge} />
        ))}
      </CardContent>
    </Card>
  );
}
