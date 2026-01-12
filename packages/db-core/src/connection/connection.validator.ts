import { ErrorCodes } from '../shared/errors';
import type { ValidationResult, ConnectionError } from './connection.types';

/**
 * Valid PostgreSQL connection string prefixes
 */
const POSTGRES_PREFIXES = ['postgres://', 'postgresql://'];

/**
 * Default PostgreSQL port
 */
const DEFAULT_PORT = 5432;

/**
 * Default PostgreSQL user
 */
const DEFAULT_USER = 'postgres';

/**
 * Validates that a connection string is for PostgreSQL and has valid format.
 *
 * @param connectionString - The connection string to validate
 * @returns ValidationResult with parsed info or error
 */
export function validatePostgresConnectionString(
  connectionString: string,
): ValidationResult {
  // Trim whitespace
  const trimmed = connectionString.trim();

  // Check if empty
  if (!trimmed) {
    return {
      valid: false,
      error: createError(
        ErrorCodes.INVALID_CONNECTION_STRING,
        'Connection string is empty',
        'Provide a valid PostgreSQL connection string',
        'Format: postgres://user:password@host:port/database',
      ),
    };
  }

  // Check if it's PostgreSQL
  const isPostgres = POSTGRES_PREFIXES.some((prefix) =>
    trimmed.toLowerCase().startsWith(prefix),
  );

  if (!isPostgres) {
    // Try to detect other database types for better error messages
    const detectedDb = detectDatabaseType(trimmed);
    const details = detectedDb
      ? `Detected ${detectedDb} connection string`
      : 'Connection string does not start with postgres:// or postgresql://';

    return {
      valid: false,
      error: createError(
        ErrorCodes.UNSUPPORTED_DATABASE,
        'Only PostgreSQL databases are supported',
        details,
        'Connection string must start with postgres:// or postgresql://',
      ),
    };
  }

  // Parse and validate URL format
  try {
    const url = new URL(trimmed);

    // Validate hostname
    if (!url.hostname) {
      return {
        valid: false,
        error: createError(
          ErrorCodes.INVALID_CONNECTION_STRING,
          'Missing hostname in connection string',
          'No host specified in the connection URL',
          'Format: postgres://user:password@host:port/database',
        ),
      };
    }

    // Validate database name
    const database = url.pathname.slice(1); // Remove leading /
    if (!database) {
      return {
        valid: false,
        error: createError(
          ErrorCodes.INVALID_CONNECTION_STRING,
          'Missing database name in connection string',
          'No database specified after the host',
          'Format: postgres://user:password@host:port/database',
        ),
      };
    }

    // Parse port (default to 5432)
    const port = url.port ? parseInt(url.port, 10) : DEFAULT_PORT;
    if (isNaN(port) || port < 1 || port > 65535) {
      return {
        valid: false,
        error: createError(
          ErrorCodes.INVALID_CONNECTION_STRING,
          'Invalid port number',
          `Port "${url.port}" is not a valid port number`,
          'Port must be a number between 1 and 65535',
        ),
      };
    }

    // Parse user (default to postgres)
    const user = url.username || DEFAULT_USER;

    return {
      valid: true,
      parsed: {
        host: url.hostname,
        port,
        database,
        user,
      },
    };
  } catch {
    return {
      valid: false,
      error: createError(
        ErrorCodes.INVALID_CONNECTION_STRING,
        'Invalid connection string format',
        'Could not parse the connection string as a valid URL',
        'Format: postgres://user:password@host:port/database',
      ),
    };
  }
}

/**
 * Try to detect the database type from a connection string
 */
function detectDatabaseType(connectionString: string): string | null {
  const lower = connectionString.toLowerCase();

  if (lower.startsWith('mysql://') || lower.startsWith('mysql2://')) {
    return 'MySQL';
  }
  if (lower.startsWith('mongodb://') || lower.startsWith('mongodb+srv://')) {
    return 'MongoDB';
  }
  if (lower.startsWith('redis://') || lower.startsWith('rediss://')) {
    return 'Redis';
  }
  if (lower.startsWith('sqlserver://') || lower.startsWith('mssql://')) {
    return 'SQL Server';
  }
  if (lower.includes('.sqlite') || lower.startsWith('sqlite:')) {
    return 'SQLite';
  }

  return null;
}

/**
 * Helper to create a ConnectionError
 */
function createError(
  code: string,
  message: string,
  details: string,
  suggestion: string,
): ConnectionError {
  return { code, message, details, suggestion };
}
