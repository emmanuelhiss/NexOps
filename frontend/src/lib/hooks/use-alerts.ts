"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { useWebSocket, useWebSocketEvent } from "@/lib/hooks/use-websocket";
import type { Alert, AlertRule, ApiResponse } from "@/types";

const POLL_INTERVAL = 30000;

export function useAlerts(status?: string) {
  const { connected } = useWebSocket();
  const endpoint = status
    ? `/api/v1/alerts?status=${status}`
    : "/api/v1/alerts";

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Alert[]>>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: connected ? 0 : POLL_INTERVAL,
    }
  );

  useWebSocketEvent("alert_update", () => {
    mutate();
  });

  return {
    alerts: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useAlertRules() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<AlertRule[]>>(
    "/api/v1/alerts/rules",
    fetcher
  );

  return {
    rules: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}
