/**
 * API Client
 * Handles HTTP requests with authentication and error handling
 */

import { API_CONFIG } from "@/app/config/api";
import { UuAppResponse, UuAppErrorMap } from "@/app/dto";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: UuAppErrorMap
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Make an API request with automatic authentication headers
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options;

  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add authentication headers if required
  if (requireAuth) {
    // Get user from localStorage (client-side only)
    let userId = API_CONFIG.mockUser.uuIdentity;
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          userId = user.id;
        } catch {
          // Fall back to mock user
        }
      }
    }
    headers["x-uu-identity"] = userId;
    headers["x-awid"] = API_CONFIG.mockUser.awid;
    headers["x-uu-profile"] = API_CONFIG.mockUser.profile;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data: UuAppResponse<T> = await response.json();

    // Check for errors in response
    if (
      !response.ok ||
      (data.uuAppErrorMap && Object.keys(data.uuAppErrorMap).length > 0)
    ) {
      const errorMessage =
        (data.uuAppErrorMap && Object.values(data.uuAppErrorMap)[0]?.message) ||
        `API request failed: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, data.uuAppErrorMap);
    }

    return data.dtoOut;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

/**
 * GET request helper
 */
export function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | boolean>
): Promise<T> {
  const queryString = params
    ? "?" +
      Object.entries(params)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
        )
        .join("&")
    : "";
  return apiRequest<T>(`${endpoint}${queryString}`, { method: "GET" });
}

/**
 * POST request helper
 */
export function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(endpoint: string, body?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "DELETE",
    body: body ? JSON.stringify(body) : undefined,
  });
}
