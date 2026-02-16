"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Square, RotateCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { controlVM } from "@/lib/hooks/use-vms";
import type { VM } from "@/types";

interface VMTableProps {
  vms: VM[];
  onAction?: () => void;
}

const ACTION_LABELS = {
  start: "Starting",
  stop: "Stopping",
  restart: "Restarting",
} as const;

const statusDot: Record<string, string> = {
  running: "bg-success",
  stopped: "bg-muted-foreground",
  paused: "bg-warning",
  error: "bg-destructive",
};

export function VMTable({ vms, onAction }: VMTableProps) {
  const [pendingAction, setPendingAction] = useState<{
    vmId: string;
    action: "start" | "stop" | "restart";
  } | null>(null);

  async function handleAction(vm: VM, action: "start" | "stop" | "restart") {
    setPendingAction({ vmId: vm.id, action });
    toast.info(`${ACTION_LABELS[action]} ${vm.name}...`);
    try {
      await controlVM(vm.id, action);
      toast.success(`${vm.name} — ${action} command sent`);
      onAction?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to ${action} ${vm.name}`
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Name</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Status</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Type</TableHead>
          <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">CPU</TableHead>
          <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Memory</TableHead>
          <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Disk</TableHead>
          <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">IP</TableHead>
          <TableHead className="text-right pr-4 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vms.map((vm) => {
          const isPending = pendingAction?.vmId === vm.id;
          return (
            <TableRow key={vm.id} className="hover:bg-white/[0.03] transition-colors">
              <TableCell>
                <Link
                  href={`/infrastructure/${vm.id}`}
                  className="font-medium font-mono text-sm hover:text-primary transition-colors"
                >
                  {vm.name}
                </Link>
              </TableCell>
              <TableCell>
                {isPending ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    {pendingAction ? ACTION_LABELS[pendingAction.action] : ""}...
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    vm.status === "running" ? "text-success" : "text-muted-foreground"
                  }`}>
                    <span className={`size-1.5 rounded-full ${statusDot[vm.status] ?? "bg-muted-foreground"}`} />
                    {vm.status}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground uppercase font-mono">
                {vm.type}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {vm.cpu_cores}
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {(vm.memory_mb / 1024).toFixed(1)} GB
              </TableCell>
              <TableCell className="text-right font-mono text-sm">
                {vm.disk_gb.toFixed(1)} GB
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {vm.ip_address ?? "-"}
              </TableCell>
              <TableCell className="text-right pr-3">
                <div className="flex justify-end gap-1">
                  {vm.status !== "running" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-success hover:text-success hover:bg-success/10"
                      disabled={pendingAction !== null}
                      onClick={() => handleAction(vm, "start")}
                    >
                      <Play className="size-3.5" />
                    </Button>
                  )}
                  {vm.status === "running" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground hover:bg-white/5"
                        disabled={pendingAction !== null}
                        onClick={() => handleAction(vm, "restart")}
                      >
                        <RotateCw className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={pendingAction !== null}
                        onClick={() => handleAction(vm, "stop")}
                      >
                        <Square className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
