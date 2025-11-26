import { ApiError, ApiErrorResponse } from '@/types/error';
import { isAxiosError, isApiErrorResponse } from '@/lib/utils/type-guards';

/**
 * Handle API errors and convert to ApiError format
 */
export function handleApiError(error: unknown): ApiError {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response;
    
    if (response) {
      const data = response.data;
      
      // Use type guard to safely check response data
      if (isApiErrorResponse(data)) {
        return {
          error: data.error || 'An error occurred',
          details: data.details,
          statusCode: response.status,
        };
      }
      
      // Fallback: try to extract error message from response data
      if (typeof data === 'object' && data !== null && 'error' in data) {
        const errorValue = (data as { error: unknown }).error;
        const errorMessage = typeof errorValue === 'string' ? errorValue : 'An error occurred';
        return {
          error: errorMessage,
          statusCode: response.status,
        };
      }
      
      // Generic error response
      return {
        error: 'An error occurred',
        statusCode: response.status,
      };
    }

    if (error.request) {
      return {
        error: 'Network error. Please check your connection.',
        statusCode: 0,
      };
    }
  }

  if (error instanceof Error) {
    return {
      error: error.message,
    };
  }

  return {
    error: 'An unexpected error occurred',
  };
}

/**
 * Extract error message from unknown error
 * Uses handleApiError internally for consistency
 */
export function getErrorMessage(error: unknown): string {
  const apiError = handleApiError(error);
  return apiError.error;
}

