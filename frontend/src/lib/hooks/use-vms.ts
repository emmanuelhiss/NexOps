"use client";

import useSWR from "swr";
import { fetchApi, fetcher } from "@/lib/api";
import type { ApiResponse, VM, VMMetrics } from "@/types";

export function useVMs(nodeId?: string) {
  const params = nodeId ? `?node_id=${nodeId}` : "";
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<VM[]>>(
    `/api/v1/infrastructure/vms${params}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 10000 }
  );

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

  return {
    vm: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export function useVMMetrics(vmId: string) {
  const { data, error, isLoading } = useSWR<VMMetrics>(
    vmId ? `/api/v1/infrastructure/vms/${vmId}/metrics` : null,
    fetcher,
    { refreshInterval: 30000 }
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
