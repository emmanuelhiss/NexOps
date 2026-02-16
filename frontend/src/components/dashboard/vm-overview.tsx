"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { useVMs } from "@/lib/hooks/use-vms";

export function VMOverview() {
  const { vms, isLoading, error } = useVMs();

  if (isLoading) {
    return (
      <Card className="card-content">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            VM Overview
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
            VM Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive py-8 text-center">
            Failed to load VMs
          </p>
        </CardContent>
      </Card>
    );
  }

  const topVMs = vms.slice(0, 5);

  return (
    <Card className="card-content">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          VM Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topVMs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No VMs found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  Name
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  Status
                </TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  CPU
                </TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  Memory
                </TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  Disk
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topVMs.map((vm) => (
                <TableRow key={vm.id} className="hover:bg-white/[0.03]">
                  <TableCell className="font-medium font-mono text-sm">
                    {vm.name}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      vm.status === "running" ? "text-success" : "text-muted-foreground"
                    }`}>
                      <span className={`size-1.5 rounded-full ${
                        vm.status === "running" ? "bg-success" : "bg-muted-foreground"
                      }`} />
                      {vm.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {vm.cpu_cores} cores
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {(vm.memory_mb / 1024).toFixed(1)} GB
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {vm.disk_gb.toFixed(1)} GB
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
