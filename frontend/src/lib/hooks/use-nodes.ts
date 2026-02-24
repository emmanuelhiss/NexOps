"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { useWebSocket, useWebSocketEvent } from "@/lib/hooks/use-websocket";
import type { ApiResponse, Node } from "@/types";

const POLL_INTERVAL = 30000;

export function useNodes() {
  const { connected } = useWebSocket();
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Node[]>>(
    "/api/v1/infrastructure/nodes",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: connected ? 0 : POLL_INTERVAL }
  );

  useWebSocketEvent("infra_update", () => {
    mutate();
  });

  return {
    nodes: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}
