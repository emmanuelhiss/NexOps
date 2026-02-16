"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Boxes,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Infrastructure", href: "/infrastructure", icon: Server },
      { name: "Services", href: "/services", icon: Boxes },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Alerts", href: "/alerts", icon: Bell },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
              N
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
              NexOps
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
            N
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                const linkContent = (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                    )}
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.name} delayDuration={0}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-sidebar-foreground/40 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
