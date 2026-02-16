"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMetricsOverview } from "@/lib/hooks/use-metrics";

export function Header() {
  const { overview } = useMetricsOverview();
  const alertCount = overview?.active_alerts ?? 0;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {alertCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {alertCount}
            </Badge>
          )}
        </Button>
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            NX
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
