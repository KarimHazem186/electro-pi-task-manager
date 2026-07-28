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
});

// Attach JWT token from localStorage to all requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle API errors and extract data from success responses
api.interceptors.response.use(
  (response) => {
    // Backend returns data in { success: true, data: {...} }
    if (response.data && response.data.success !== undefined) {
      return { ...response, data: response.data.data || response.data };
    }
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
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
