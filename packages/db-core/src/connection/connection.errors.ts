import { ErrorCodes } from '../shared/errors';
import type {
  ConnectionError,
  ParsedConnectionString,
} from './connection.types';

/**
 * Mapping from Node.js and PostgreSQL error codes to our error codes
 */
const PG_ERROR_MAP: Record<string, string> = {
  // Node.js network errors
  ECONNREFUSED: ErrorCodes.CONNECTION_REFUSED,
  ENOTFOUND: ErrorCodes.HOST_NOT_FOUND,
  EAI_AGAIN: ErrorCodes.HOST_NOT_FOUND,
  ETIMEDOUT: ErrorCodes.CONNECTION_TIMEOUT,
  ENETUNREACH: ErrorCodes.NETWORK_ERROR,
  EHOSTUNREACH: ErrorCodes.NETWORK_ERROR,
  ECONNRESET: ErrorCodes.CONNECTION_RESET,

  // PostgreSQL SQLSTATE codes
  '28P01': ErrorCodes.AUTH_FAILED, // invalid_password
  '28000': ErrorCodes.AUTH_FAILED, // invalid_authorization_specification
  '3D000': ErrorCodes.DATABASE_NOT_FOUND, // invalid_catalog_name
  '42501': ErrorCodes.PERMISSION_DENIED, // insufficient_privilege
  '53300': ErrorCodes.TOO_MANY_CONNECTIONS, // too_many_connections
  '08P01': ErrorCodes.SSL_REQUIRED, // protocol_violation (often SSL)
};

/**
 * Error messages and suggestions for each error code
 */
const ERROR_MESSAGES: Record<
  string,
  { message: string; suggestion: (info?: ParsedConnectionString) => string }
> = {
  [ErrorCodes.CONNECTION_REFUSED]: {
    message: 'Could not connect to the database server',
    suggestion: (info) =>
      `Check that PostgreSQL is running on ${info?.host || 'the host'}:${info?.port || 5432}`,
  },
  [ErrorCodes.HOST_NOT_FOUND]: {
    message: 'Database host not found',
    suggestion: (info) =>
      `Check the hostname '${info?.host || 'specified'}' is correct and reachable`,
  },
  [ErrorCodes.CONNECTION_TIMEOUT]: {
    message: 'Connection timed out',
    suggestion: (info) =>
      `The server at ${info?.host || 'the host'}:${info?.port || 5432} is not responding. Check firewall settings.`,
  },
  [ErrorCodes.NETWORK_ERROR]: {
    message: 'Network unreachable',
    suggestion: () =>
      'Check your network connection and that the host is accessible',
  },
  [ErrorCodes.CONNECTION_RESET]: {
    message: 'Connection was reset',
    suggestion: () => 'The database server closed the connection unexpectedly',
  },
  [ErrorCodes.AUTH_FAILED]: {
    message: 'Authentication failed',
    suggestion: () => 'Check your username and password are correct',
  },
  [ErrorCodes.DATABASE_NOT_FOUND]: {
    message: 'Database does not exist',
    suggestion: (info) =>
      `Check the database name '${info?.database || 'specified'}' or create it first`,
  },
  [ErrorCodes.PERMISSION_DENIED]: {
    message: 'Permission denied',
    suggestion: (info) =>
      `User '${info?.user || 'specified'}' does not have permission to access this database`,
  },
  [ErrorCodes.TOO_MANY_CONNECTIONS]: {
    message: 'Too many connections',
    suggestion: () =>
      'The database has reached its connection limit. Try again later.',
  },
  [ErrorCodes.SSL_REQUIRED]: {
    message: 'SSL connection required',
    suggestion: () => "Add '?sslmode=require' to your connection string",
  },
  [ErrorCodes.SSL_CERT_ERROR]: {
    message: 'SSL certificate error',
    suggestion: () =>
      "Check SSL certificate configuration or use '?sslmode=no-verify' for testing",
  },
  [ErrorCodes.UNKNOWN_ERROR]: {
    message: 'An unexpected error occurred',
    suggestion: () => 'Check the connection details and try again',
  },
};

/**
 * Maps a PostgreSQL or Node.js error to a user-friendly ConnectionError
 *
 * @param err - The error from pg or Node.js
 * @param connectionInfo - Parsed connection info for contextual messages
 * @returns A structured ConnectionError
 */
export function mapPgError(
  err: unknown,
  connectionInfo?: ParsedConnectionString,
): ConnectionError {
  // Extract error code - could be Node.js error or Postgres error
  const errorCode =
    (err as NodeJS.ErrnoException)?.code ||
    (err as { code?: string })?.code ||
    '';

  // Map to our error code
  const mappedCode = PG_ERROR_MAP[errorCode] || ErrorCodes.UNKNOWN_ERROR;

  // Get message template
  const template =
    ERROR_MESSAGES[mappedCode] || ERROR_MESSAGES[ErrorCodes.UNKNOWN_ERROR];

  // Extract the original error message for details
  const originalMessage = err instanceof Error ? err.message : String(err);

  return {
    code: mappedCode,
    message: template.message,
    details: originalMessage,
    suggestion: template.suggestion(connectionInfo),
  };
}

/**
 * Create a connection error for application-level errors
 */
export function createConnectionError(
  code: string,
  message: string,
  suggestion: string,
  details?: string,
): ConnectionError {
  return {
    code,
    message,
    suggestion,
    details,
  };
}
