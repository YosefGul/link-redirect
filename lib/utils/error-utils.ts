import { AxiosError } from 'axios';
import { isAxiosError, isApiErrorResponse, isErrorWithMessage } from './type-guards';
import { ApiErrorResponse } from '@/types/error';

/**
 * Safely extract error message from AxiosError
 */
export function extractAxiosError(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.data) {
      const data = error.response.data;
      if (isApiErrorResponse(data)) {
        return data.error;
      }
      // Fallback: try to extract error message from response data
      if (typeof data === 'object' && data !== null && 'error' in data) {
        const errorValue = (data as { error: unknown }).error;
        if (typeof errorValue === 'string') {
          return errorValue;
        }
      }
    }
    // Network error or request error
    if (error.request && !error.response) {
      return 'Network error. Please check your connection.';
    }
    return error.message || 'An error occurred';
  }

  if (isErrorWithMessage(error)) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Safely extract API error response from AxiosError
 */
export function extractApiError(
  error: unknown
): ApiErrorResponse | null {
  if (isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.data && isApiErrorResponse(error.response.data)) {
      return error.response.data;
    }
  }
  return null;
}

/**
 * Universal error message extractor
 * Tries multiple strategies to extract a meaningful error message
 */
export function getErrorMessage(error: unknown): string {
  // Try AxiosError first
  if (isAxiosError(error)) {
    return extractAxiosError(error);
  }

  // Try Error object
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  // Try string
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'An unexpected error occurred';
}

/**
 * Extract HTTP status code from error
 */
export function getErrorStatus(error: unknown): number | null {
  if (isAxiosError(error) && error.response) {
    return error.response.status;
  }
  return null;
}

/**
 * Check if error is a specific HTTP status
 */
export function isErrorStatus(
  error: unknown,
  status: number
): boolean {
  return getErrorStatus(error) === status;
}

/**
 * Check if error is a network error (no response)
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error)) {
    return !!error.request && !error.response;
  }
  return false;
}

