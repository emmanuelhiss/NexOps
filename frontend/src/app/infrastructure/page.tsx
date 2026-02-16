"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CardSkeleton, TableSkeleton } from "@/components/common/loading-skeleton";
import { NodeCard } from "@/components/infrastructure/node-card";
import { VMTable } from "@/components/infrastructure/vm-table";
import { useNodes } from "@/lib/hooks/use-nodes";
import { useVMs } from "@/lib/hooks/use-vms";

export default function InfrastructurePage() {
  const { nodes, isLoading: nodesLoading } = useNodes();
  const { vms, isLoading: vmsLoading, mutate } = useVMs();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Infrastructure</h1>

      <section>
        <h2 className="mb-4 text-lg font-medium text-muted-foreground">
          Nodes
        </h2>
        {nodesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : nodes.length === 0 ? (
          <Card className="card-content">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No nodes found. Make sure Proxmox is connected and sync has run.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nodes.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium text-muted-foreground">
          Virtual Machines
        </h2>
        {vmsLoading ? (
          <Card className="card-content">
            <CardContent className="p-6">
              <TableSkeleton rows={8} />
            </CardContent>
          </Card>
        ) : vms.length === 0 ? (
          <Card className="card-content">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No VMs found.
            </CardContent>
          </Card>
        ) : (
          <Card className="card-content">
            <CardContent className="p-0">
              <VMTable vms={vms} onAction={() => mutate()} />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
