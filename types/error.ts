export interface ApiError {
  error: string;
  details?: unknown;
  statusCode?: number;
}

export interface ApiErrorResponse {
  error: string;
  details?: Array<{ path: string; message: string }>;
}

