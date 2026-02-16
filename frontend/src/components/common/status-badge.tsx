import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  online: "bg-success/15 text-success border-success/30",
  running: "bg-success/15 text-success border-success/30",
  healthy: "bg-success/15 text-success border-success/30",
  resolved: "bg-success/15 text-success border-success/30",
  offline: "bg-muted text-muted-foreground border-muted",
  stopped: "bg-muted text-muted-foreground border-muted",
  maintenance: "bg-warning/15 text-warning border-warning/30",
  degraded: "bg-warning/15 text-warning border-warning/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  acknowledged: "bg-warning/15 text-warning border-warning/30",
  paused: "bg-warning/15 text-warning border-warning/30",
  error: "bg-destructive/15 text-destructive border-destructive/30",
  unhealthy: "bg-destructive/15 text-destructive border-destructive/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  firing: "bg-destructive/15 text-destructive border-destructive/30",
  unknown: "bg-muted text-muted-foreground border-muted",
  info: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium capitalize",
        statusStyles[status] ?? statusStyles.unknown,
        className
      )}
    >
      {status}
    </Badge>
  );
}
