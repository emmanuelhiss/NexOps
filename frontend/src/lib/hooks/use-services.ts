"use client";

import useSWR from "swr";
import { fetchApi, fetcher } from "@/lib/api";
import type { ApiResponse, Service } from "@/types";

export function useServices() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Service[]>>(
    "/api/v1/services",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  return {
    services: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    error,
    mutate,
  };
}

export function useService(serviceId: string) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Service>>(
    serviceId ? `/api/v1/services/${serviceId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    service: data?.data ?? null,
    isLoading,
    error,
    mutate,
  };
}

export async function createService(body: Partial<Service>) {
  return fetchApi<ApiResponse<Service>>("/api/v1/services", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateService(serviceId: string, body: Partial<Service>) {
  return fetchApi<ApiResponse<Service>>(`/api/v1/services/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteService(serviceId: string) {
  return fetchApi(`/api/v1/services/${serviceId}`, { method: "DELETE" });
}
