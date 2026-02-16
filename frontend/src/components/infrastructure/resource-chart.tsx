"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/common/loading-skeleton";
import { useMetricsTimeSeries } from "@/lib/hooks/use-metrics";

interface ResourceChartProps {
  sourceId: string;
  range?: "1h" | "6h" | "24h" | "7d";
}

const METRIC_COLORS: Record<string, string> = {
  cpu_usage: "#3b82f6",
  memory_usage: "#8b5cf6",
  disk_usage: "#06b6d4",
  network_in: "#10b981",
  network_out: "#f59e0b",
};

export function ResourceChart({ sourceId, range = "1h" }: ResourceChartProps) {
  const { series, isLoading } = useMetricsTimeSeries(sourceId, range);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (series.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            No metrics data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const timestamps = new Set<string>();
  for (const s of series) {
    for (const point of s.data) {
      timestamps.add(point.timestamp);
    }
  }

  const chartData = Array.from(timestamps)
    .sort()
    .map((ts) => {
      const row: Record<string, string | number> = {
        timestamp: new Date(ts).toLocaleTimeString(),
      };
      for (const s of series) {
        const point = s.data.find((p) => p.timestamp === ts);
        row[s.metric_name] = point?.value ?? 0;
      }
      return row;
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Resource Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              {series.map((s) => {
                const color = METRIC_COLORS[s.metric_name] ?? "#3b82f6";
                return (
                  <linearGradient
                    key={s.metric_name}
                    id={`gradient-${s.metric_name}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "12px",
              }}
            />
            <Legend />
            {series.map((s) => {
              const color = METRIC_COLORS[s.metric_name] ?? "#3b82f6";
              return (
                <Area
                  key={s.metric_name}
                  type="monotone"
                  dataKey={s.metric_name}
                  stroke={color}
                  fill={`url(#gradient-${s.metric_name})`}
                  strokeWidth={2}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
