/**
 * Base error interface for all db-core errors
 */
export interface DbError {
  code: string;
  message: string;
  details?: string;
  suggestion?: string;
}

/**
 * Error codes used throughout db-core
 */
export const ErrorCodes = {
  // Connection validation errors
  UNSUPPORTED_DATABASE: 'UNSUPPORTED_DATABASE',
  INVALID_CONNECTION_STRING: 'INVALID_CONNECTION_STRING',

  // Connection errors
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  HOST_NOT_FOUND: 'HOST_NOT_FOUND',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_RESET: 'CONNECTION_RESET',

  // Auth errors
  AUTH_FAILED: 'AUTH_FAILED',

  // Database errors
  DATABASE_NOT_FOUND: 'DATABASE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // Resource errors
  TOO_MANY_CONNECTIONS: 'TOO_MANY_CONNECTIONS',

  // SSL errors
  SSL_REQUIRED: 'SSL_REQUIRED',
  SSL_CERT_ERROR: 'SSL_CERT_ERROR',

  // Application state errors
  ALREADY_CONNECTED: 'ALREADY_CONNECTED',
  NOT_CONNECTED: 'NOT_CONNECTED',

  // Fallback
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
