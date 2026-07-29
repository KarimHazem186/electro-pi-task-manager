import type { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Map backend error messages to translation keys
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Authentication errors
  "Invalid credentials": "errors.api.invalidCredentials",
  "User already exists": "errors.api.emailExists",
  "Email already exists": "errors.api.emailExists",
  "Invalid email or password": "errors.api.invalidCredentials",
  "Unauthorized": "errors.api.unauthorized",
  "Token expired": "errors.api.unauthorized",
  "No token provided": "errors.api.unauthorized",
  
  // Validation errors
  "Validation error": "errors.api.validationError",
  "Validation failed": "errors.api.validationError",
  "Invalid input": "errors.api.validationError",
  "Password too weak": "errors.api.weakPassword",
  "Password must be": "errors.api.weakPassword",
  
  // Permission errors
  "Forbidden": "errors.api.forbidden",
  "Access denied": "errors.api.forbidden",
  "Not authorized": "errors.api.forbidden",
  
  // Not found errors
  "Not found": "errors.api.notFound",
  "Resource not found": "errors.api.notFound",
  "User not found": "errors.api.notFound",
  "Project not found": "errors.api.notFound",
  "Task not found": "errors.api.notFound",
};

/**
 * Get translation key for an error message
 */
export function getErrorTranslationKey(error: unknown): string {
  if (!error) return "errors.api.unknownError";

  // Handle Axios errors
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data as ErrorResponse | undefined;
    const message = responseData?.message || responseData?.error || error.message;

    // Map by status code first
    if (status === 401) return "errors.api.unauthorized";
    if (status === 403) return "errors.api.forbidden";
    if (status === 404) return "errors.api.notFound";
    if (status === 422) return "errors.api.validationError";
    if (status && status >= 500) return "errors.api.serverError";

    // Try to match error message
    if (message) {
      for (const [pattern, key] of Object.entries(ERROR_MESSAGE_MAP)) {
        if (message.toLowerCase().includes(pattern.toLowerCase())) {
          return key;
        }
      }
    }

    // Network errors
    if (error.code === "ERR_NETWORK" || !error.response) {
      return "errors.api.networkError";
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message;
    for (const [pattern, key] of Object.entries(ERROR_MESSAGE_MAP)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return key;
      }
    }
  }

  return "errors.api.unknownError";
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    Boolean((error as AxiosError).isAxiosError)
  );
}

/**
 * Get error message from an error object (for debugging)
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as ErrorResponse | undefined;
    return responseData?.message || responseData?.error || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
