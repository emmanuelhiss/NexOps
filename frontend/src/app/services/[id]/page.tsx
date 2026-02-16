"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { ResourceChart } from "@/components/infrastructure/resource-chart";
import { useService } from "@/lib/hooks/use-services";

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { service, isLoading } = useService(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Service not found.</p>
        <Link href="/services" className="mt-4 text-primary hover:underline">
          Back to services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/services">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{service.name}</h1>
          {service.description && (
            <p className="text-sm text-muted-foreground">{service.description}</p>
          )}
        </div>
        <StatusBadge status={service.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{service.type}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge status={service.status} />
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Health Check URL</span>
              <span className="font-mono text-xs">
                {service.health_check_url ?? "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Last Health Check</span>
              <span>
                {service.last_health_check
                  ? new Date(service.last_health_check).toLocaleString()
                  : "Never"}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Namespace</span>
              <span className="font-mono">{service.namespace ?? "N/A"}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(service.created_at).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ResourceChart sourceId={id} />
    </div>
  );
}
