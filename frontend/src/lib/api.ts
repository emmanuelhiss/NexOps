const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      body?.error?.code || "UNKNOWN",
      body?.error?.message || `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export function fetcher<T>(url: string): Promise<T> {
  return fetchApi<T>(url);
}
