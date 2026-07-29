import axios, { type AxiosInstance } from "axios";

/**
 * Central axios instance. Connected to real backend API.
 */
export const USE_MOCKS = false;

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Enable cookies - tokens are in HTTP-only cookies
});

// No need for Authorization header - cookies are sent automatically

// Handle API errors, token refresh, and extract data
api.interceptors.response.use(
  (response) => {
    // Backend returns data in { success: true, data: {...} }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (response.data && (response.data as any).success !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...response, data: (response.data as any).data || response.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry on rate limit errors (429)
    if (error.response?.status === 429) {
      const backendMessage = error.response?.data?.message || 'Too many requests, please try again later.';
      const enhancedError = new Error(backendMessage);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enhancedError as any).status = 429;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enhancedError as any).response = error.response;
      return Promise.reject(enhancedError);
    }

    // Handle token expiration - try to refresh
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token (cookies are sent automatically)
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - just reject, don't redirect
        // Let the component handle the redirect
        return Promise.reject(refreshError);
      }
    }

    // For 401 errors, don't auto-redirect
    // Let the AppShell component handle it
    // This prevents infinite loops

    // Extract error message from backend response
    const backendMessage = error.response?.data?.message || error.response?.data?.error;
    if (backendMessage) {
      // Create a new error with the backend message
      const enhancedError = new Error(backendMessage);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enhancedError as any).status = error.response?.status;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enhancedError as any).response = error.response;
      return Promise.reject(enhancedError);
    }

    return Promise.reject(error);
  },
);

/** Simulated latency so loading/skeleton states are exercised in the UI. */
export function mockDelay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Runs the mock resolver while USE_MOCKS is on, otherwise the real request.
 */
export async function resolve<T>(
  mock: () => T | Promise<T>,
  request: () => Promise<T>,
): Promise<T> {
  if (USE_MOCKS) return mockDelay(await mock());
  return request();
}
