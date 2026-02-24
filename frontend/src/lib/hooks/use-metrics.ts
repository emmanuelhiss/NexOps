"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { useWebSocket, useWebSocketEvent } from "@/lib/hooks/use-websocket";
import type { ApiResponse, MetricTimeSeries, ResourceOverview } from "@/types";

const POLL_INTERVAL = 30000;

export function useMetricsOverview() {
  const { connected } = useWebSocket();
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ResourceOverview>>(
    "/api/v1/metrics/overview",
    fetcher,
    { refreshInterval: connected ? 0 : POLL_INTERVAL }
  );

  useWebSocketEvent("metrics_update", () => {
    mutate();
  });

  return {
    overview: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useMetricsTimeSeries(
  sourceId: string,
  range: "1h" | "6h" | "24h" | "7d" = "1h"
) {
  const { connected } = useWebSocket();
  const { data, error, isLoading } = useSWR<ApiResponse<MetricTimeSeries[]>>(
    sourceId ? `/api/v1/metrics/${sourceId}?range=${range}` : null,
    fetcher,
    { refreshInterval: connected ? 0 : POLL_INTERVAL }
  );

  return {
    series: data?.data ?? [],
    isLoading,
    error,
  };
}
