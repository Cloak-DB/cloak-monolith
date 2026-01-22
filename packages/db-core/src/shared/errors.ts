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

  // Query errors
  QUERY_ERROR: 'QUERY_ERROR',

  // Schema mismatch errors (indicates schema changed since last fetch)
  SCHEMA_MISMATCH: 'SCHEMA_MISMATCH',

  // Fallback
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Create a standardized DbError
 */
export function createError(
  code: ErrorCode,
  message: string,
  details?: string,
  suggestion?: string,
): DbError {
  return { code, message, details, suggestion };
}

/**
 * PostgreSQL error codes that indicate a schema mismatch
 * These errors suggest the database schema has changed since we last fetched it
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PG_SCHEMA_ERROR_CODES = {
  // Class 42 — Syntax Error or Access Rule Violation
  UNDEFINED_COLUMN: '42703', // Column doesn't exist (deleted/renamed)
  UNDEFINED_TABLE: '42P01', // Table doesn't exist (deleted/renamed)
  UNDEFINED_OBJECT: '42704', // Object doesn't exist
  DATATYPE_MISMATCH: '42804', // Type incompatibility

  // Class 22 — Data Exception (can indicate type changes)
  INVALID_TEXT_REPRESENTATION: '22P02', // e.g., trying to insert text into integer

  // Application-level schema drift detection (proactive, not from DB error)
  SCHEMA_DRIFT: 'SCHEMA_DRIFT', // Detected via column comparison on refetch
} as const;

/**
 * Check if a PostgreSQL error code indicates a schema mismatch
 *
 * @param pgErrorCode - The PostgreSQL error code (e.g., '42703')
 * @returns true if the error suggests the schema has changed
 */
export function isSchemaError(pgErrorCode: string | undefined): boolean {
  if (!pgErrorCode) return false;

  const schemaErrorCodes = Object.values(PG_SCHEMA_ERROR_CODES);
  return schemaErrorCodes.includes(
    pgErrorCode as (typeof schemaErrorCodes)[number],
  );
}

/**
 * Get a human-readable description of a schema error
 *
 * @param pgErrorCode - The PostgreSQL error code
 * @returns A user-friendly description or undefined if not a schema error
 */
export function getSchemaErrorDescription(
  pgErrorCode: string | undefined,
): string | undefined {
  if (!pgErrorCode) return undefined;

  switch (pgErrorCode) {
    case PG_SCHEMA_ERROR_CODES.UNDEFINED_COLUMN:
      return 'A column no longer exists. The table structure may have changed.';
    case PG_SCHEMA_ERROR_CODES.UNDEFINED_TABLE:
      return 'The table no longer exists. It may have been renamed or deleted.';
    case PG_SCHEMA_ERROR_CODES.UNDEFINED_OBJECT:
      return 'A database object no longer exists.';
    case PG_SCHEMA_ERROR_CODES.DATATYPE_MISMATCH:
      return 'A column type has changed. The data may need to be reformatted.';
    case PG_SCHEMA_ERROR_CODES.INVALID_TEXT_REPRESENTATION:
      return 'The data format is incompatible with the column type.';
    case PG_SCHEMA_ERROR_CODES.SCHEMA_DRIFT:
      return 'The table structure has changed since you started editing.';
    default:
      return undefined;
  }
}
