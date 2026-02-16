"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { ResourceGauges } from "@/components/dashboard/resource-gauges";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import { VMOverview } from "@/components/dashboard/vm-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <StatsCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <ResourceGauges />
        <RecentAlerts />
      </div>
      <VMOverview />
    </div>
  );
}
