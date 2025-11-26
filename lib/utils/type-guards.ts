import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/types/error';
import { JWTPayload } from '@/types/auth';

/**
 * Type guard for AxiosError with typed response data
 */
export function isAxiosError<T = unknown>(
  error: unknown
): error is AxiosError<T> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Type guard for API error response structure
 */
export function isApiErrorResponse(
  data: unknown
): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as ApiErrorResponse).error === 'string'
  );
}

/**
 * Type guard for Error objects with message property
 */
export function isErrorWithMessage(error: unknown): error is Error {
  return (
    error instanceof Error ||
    (typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string')
  );
}

/**
 * Type guard for JWT decoded payload structure
 */
export function isValidJWTPayload(
  decoded: unknown
): decoded is JWTPayload {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    'userId' in decoded &&
    'username' in decoded &&
    'role' in decoded &&
    typeof (decoded as JWTPayload).userId === 'string' &&
    typeof (decoded as JWTPayload).username === 'string' &&
    ((decoded as JWTPayload).role === 'ADMIN' ||
      (decoded as JWTPayload).role === 'USER')
  );
}

/**
 * Type guard for objects with a specific string property
 */
export function hasStringProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, string> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    prop in obj &&
    typeof (obj as Record<string, unknown>)[prop] === 'string'
  );
}

/**
 * Type guard for objects with a specific number property
 */
export function hasNumberProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, number> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    prop in obj &&
    typeof (obj as Record<string, unknown>)[prop] === 'number'
  );
}

