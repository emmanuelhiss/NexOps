"use client";

import { Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Node } from "@/types";

interface NodeCardProps {
  node: Node;
}

function GradientProgress({ value, label, gradient }: { value: number; label: string; gradient: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{value.toFixed(1)}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/[0.04]">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: gradient,
          }}
        />
      </div>
    </div>
  );
}

export function NodeCard({ node }: NodeCardProps) {
  const meta = node.metadata as Record<string, number> | null;

  return (
    <Card className="card-node">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
            <Server className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-[15px] tracking-tight">{node.hostname}</CardTitle>
            <p className="text-xs text-muted-foreground font-mono">
              {node.ip_address}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
          node.status === "online" ? "text-success" : "text-muted-foreground"
        }`}>
          <span className={`size-1.5 rounded-full ${
            node.status === "online" ? "bg-success animate-pulse" : "bg-muted-foreground"
          }`} />
          {node.status}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        <GradientProgress
          value={meta?.cpu_usage ?? 0}
          label={`CPU (${node.cpu_cores} cores)`}
          gradient="linear-gradient(90deg, #3b82f6, #60a5fa)"
        />
        <GradientProgress
          value={meta?.memory_usage ?? 0}
          label={`Memory (${(node.memory_total_mb / 1024).toFixed(0)} GB)`}
          gradient="linear-gradient(90deg, #8b5cf6, #a78bfa)"
        />
        <GradientProgress
          value={meta?.disk_usage ?? 0}
          label={`Disk (${node.disk_total_gb} GB)`}
          gradient="linear-gradient(90deg, #06b6d4, #22d3ee)"
        />
        {node.last_seen_at && (
          <p className="text-[11px] text-muted-foreground/60 pt-1">
            Last seen {new Date(node.last_seen_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
