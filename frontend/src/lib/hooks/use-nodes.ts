"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { ApiResponse, Node } from "@/types";

export function useNodes() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Node[]>>(
    "/api/v1/infrastructure/nodes",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );

  return {
    nodes: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
