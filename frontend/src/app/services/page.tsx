"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { useServices } from "@/lib/hooks/use-services";

export default function ServicesPage() {
  const { services, isLoading } = useServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Services</h1>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <TableSkeleton rows={6} />
          </CardContent>
        </Card>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No services registered yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health Check</TableHead>
                  <TableHead>Last Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <Link
                        href={`/services/${service.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {service.name}
                      </Link>
                      {service.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {service.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">
                      {service.type}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={service.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-48 truncate">
                      {service.health_check_url ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {service.last_health_check
                        ? new Date(service.last_health_check).toLocaleString()
                        : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
