"use client";

import { Server, Monitor, MonitorCheck, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { useMetricsOverview } from "@/lib/hooks/use-metrics";

function Sparkline({ color, seed }: { color: string; seed: number }) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const base = 30 + Math.sin(i * 0.8 + seed) * 15 + Math.cos(i * 1.3 + seed * 2) * 8;
    return Math.max(5, Math.min(55, base));
  });

  const width = 120;
  const height = 40;
  const stepX = width / (points.length - 1);

  const linePoints = points.map((y, i) => `${i * stepX},${height - y}`).join(" ");
  const areaPath = `M0,${height} L${linePoints} L${width},${height} Z`;
  const linePath = `M${linePoints}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="absolute bottom-0 right-0 h-10 w-24 opacity-40"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`spark-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${seed})`} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StatsCards() {
  const { overview, isLoading, error } = useMetricsOverview();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="card-stats">
            <CardContent className="p-5">
              <p className="text-xs text-destructive">Failed to load</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Nodes",
      value: overview?.total_nodes ?? 0,
      icon: Server,
      accent: "bg-blue-500",
      iconColor: "text-blue-400",
      sparkColor: "#3b82f6",
      seed: 1,
    },
    {
      title: "Total VMs",
      value: overview?.total_vms ?? 0,
      icon: Monitor,
      accent: "bg-purple-500",
      iconColor: "text-purple-400",
      sparkColor: "#8b5cf6",
      seed: 2,
    },
    {
      title: "Running VMs",
      value: overview?.running_vms ?? 0,
      icon: MonitorCheck,
      accent: "bg-emerald-500",
      iconColor: "text-emerald-400",
      sparkColor: "#10b981",
      seed: 3,
    },
    {
      title: "Active Alerts",
      value: overview?.active_alerts ?? 0,
      icon: Bell,
      accent: "bg-amber-500",
      iconColor: "text-amber-400",
      sparkColor: "#f59e0b",
      seed: 4,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-stats relative overflow-hidden">
          <div className={`absolute inset-x-0 top-0 h-[2px] ${stat.accent}`} />
          <Sparkline color={stat.sparkColor} seed={stat.seed} />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-muted-foreground">
                {stat.title}
              </p>
              <stat.icon className={`size-4 ${stat.iconColor}`} />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight font-mono">
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
