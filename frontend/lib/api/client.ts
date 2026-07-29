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
    // Backend returns data in { success: true, data: {...}, ...pagination }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (response.data && (response.data as any).success !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      // If it has pagination info (page, pageSize, total, totalPages), preserve it
      if (apiResponse.page !== undefined && apiResponse.totalPages !== undefined) {
        return {
          ...response,
          data: {
            data: apiResponse.data || [],
            page: apiResponse.page,
            pageSize: apiResponse.pageSize,
            total: apiResponse.total,
            totalPages: apiResponse.totalPages,
          },
        };
      }
      
      // Otherwise just extract the data
      return { ...response, data: apiResponse.data || response.data };
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

    // Handle token expiration - automatic refresh
    // Check for 401 AND (TOKEN_EXPIRED code OR jwt expired message)
    const isTokenExpired = 
      error.response?.status === 401 && 
      (error.response?.data?.code === 'TOKEN_EXPIRED' || 
       error.response?.data?.message?.toLowerCase().includes('token expired') ||
       error.response?.data?.message?.toLowerCase().includes('jwt expired'));

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔄 Access token expired, refreshing...');
        
        // Try to refresh the token (cookies are sent automatically)
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`, 
          {}, 
          {
            withCredentials: true,
          }
        );

        console.log('✅ Token refreshed successfully');

        // If backend sends new access token in response, update it (for mobile apps)
        if (refreshResponse.data?.accessToken) {
          // Mobile apps can store this token
          // Cookies are already updated by the server
        }

        // Retry the original request with new cookies
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        
        // Refresh failed - clear any stored tokens and redirect to login
        // The app will handle the redirect based on the 401 error
        
        // Clear cookies by calling logout (optional)
        try {
          await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
            withCredentials: true,
          });
        } catch {
          // Ignore logout errors
        }

        // Reject with clear message
        const logoutError = new Error('Session expired. Please login again.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (logoutError as any).status = 401;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (logoutError as any).code = 'SESSION_EXPIRED';
        return Promise.reject(logoutError);
      }
    }

    // For other 401 errors (not token expiration)
    if (error.response?.status === 401) {
      const backendMessage = error.response?.data?.message || 'Not authorized';
      const enhancedError = new Error(backendMessage);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enhancedError as any).status = 401;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (enhancedError as any).response = error.response;
      return Promise.reject(enhancedError);
    }

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
