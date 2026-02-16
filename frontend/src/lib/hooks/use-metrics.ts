"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { ApiResponse, MetricTimeSeries, ResourceOverview } from "@/types";

export function useMetricsOverview() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<ResourceOverview>>(
    "/api/v1/metrics/overview",
    fetcher,
    { refreshInterval: 30000 }
  );

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
  const { data, error, isLoading } = useSWR<ApiResponse<MetricTimeSeries[]>>(
    sourceId ? `/api/v1/metrics/${sourceId}?range=${range}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    series: data?.data ?? [],
    isLoading,
    error,
  };
}
