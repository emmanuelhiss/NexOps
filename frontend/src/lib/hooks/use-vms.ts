"use client";

import useSWR from "swr";
import { fetchApi, fetcher } from "@/lib/api";
import { useWebSocket, useWebSocketEvent } from "@/lib/hooks/use-websocket";
import type { ApiResponse, VM, VMMetrics } from "@/types";

const POLL_INTERVAL = 10000;

export function useVMs(nodeId?: string) {
  const { connected } = useWebSocket();
  const params = nodeId ? `?node_id=${nodeId}` : "";
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<VM[]>>(
    `/api/v1/infrastructure/vms${params}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: connected ? 0 : POLL_INTERVAL }
  );

  useWebSocketEvent(["infra_update", "vm_action_complete"], () => {
    mutate();
  });

  return {
    vms: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useVM(vmId: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<VM>>(
    vmId ? `/api/v1/infrastructure/vms/${vmId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  useWebSocketEvent(["infra_update", "vm_action_complete"], () => {
    mutate();
  });

  return {
    vm: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useVMMetrics(vmId: string) {
  const { connected } = useWebSocket();
  const { data, error, isLoading } = useSWR<VMMetrics>(
    vmId ? `/api/v1/infrastructure/vms/${vmId}/metrics` : null,
    fetcher,
    { refreshInterval: connected ? 0 : 30000 }
  );

  return {
    metrics: data ?? null,
    isLoading,
    error,
  };
}

export async function controlVM(vmId: string, action: "start" | "stop" | "restart") {
  return fetchApi(`/api/v1/infrastructure/vms/${vmId}/${action}`, {
    method: "POST",
  });
}
