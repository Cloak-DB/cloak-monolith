/**
 * PostgreSQL error code mapping to user-friendly messages
 *
 * Maps PostgreSQL error codes to validation error format for consistent
 * error display between client-side and backend validation.
 */

import type { ValidationError } from './cell-validation';

/**
 * PostgreSQL error codes we handle
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PgErrorCodes = {
  // Class 22 - Data Exception
  INVALID_TEXT_REPRESENTATION: '22P02', // Invalid input syntax for type
  NUMERIC_VALUE_OUT_OF_RANGE: '22003',
  STRING_DATA_RIGHT_TRUNCATION: '22001',
  INVALID_DATETIME_FORMAT: '22007',
  DATETIME_FIELD_OVERFLOW: '22008',

  // Class 23 - Integrity Constraint Violation
  NOT_NULL_VIOLATION: '23502',
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  EXCLUSION_VIOLATION: '23P01',
} as const;

/**
 * Parsed information from a PostgreSQL error
 */
interface PgErrorInfo {
  code: string;
  message: string;
  detail?: string;
  column?: string;
  constraint?: string;
  table?: string;
}

/**
 * Parse column name from PostgreSQL error message or detail
 */
function extractColumnName(errorInfo: PgErrorInfo): string | undefined {
  // Try to extract from detail like 'Key (email)=(test@example.com) already exists.'
  const keyMatch = errorInfo.detail?.match(/Key \(([^)]+)\)/);
  if (keyMatch) {
    return keyMatch[1];
  }

  // Try to extract from message like 'null value in column "name" violates not-null constraint'
  const columnMatch = errorInfo.message.match(/column "([^"]+)"/);
  if (columnMatch) {
    return columnMatch[1];
  }

  // Try constraint name patterns
  if (errorInfo.constraint) {
    // Often constraint names include column name like "users_email_key"
    const parts = errorInfo.constraint.split('_');
    if (parts.length >= 2) {
      // Return the likely column name (usually second to last part)
      return parts[parts.length - 2];
    }
  }

  return errorInfo.column;
}

/**
 * Extract referenced table from foreign key error
 */
function extractReferencedTable(errorInfo: PgErrorInfo): string | undefined {
  // Detail like 'Key (user_id)=(123) is not present in table "users"'
  const tableMatch = errorInfo.detail?.match(/table "([^"]+)"/);
  return tableMatch?.[1];
}

/**
 * Map PostgreSQL error to ValidationError format
 *
 * @param code - PostgreSQL error code
 * @param message - Error message from PostgreSQL
 * @param detail - Optional detail string from PostgreSQL
 * @returns ValidationError with user-friendly message
 */
export function mapPgErrorToValidation(
  code: string,
  message: string,
  detail?: string,
  constraint?: string,
): ValidationError {
  const errorInfo: PgErrorInfo = { code, message, detail, constraint };
  const column = extractColumnName(errorInfo);
  const columnRef = column ? `"${column}"` : 'This field';

  switch (code) {
    case PgErrorCodes.NOT_NULL_VIOLATION:
      return {
        code: 'NOT_NULL_VIOLATION',
        message: `${columnRef} cannot be empty`,
      };

    case PgErrorCodes.UNIQUE_VIOLATION:
      return {
        code: 'UNIQUE_VIOLATION',
        message: `${columnRef} already exists`,
      };

    case PgErrorCodes.FOREIGN_KEY_VIOLATION: {
      const refTable = extractReferencedTable(errorInfo);
      return {
        code: 'FOREIGN_KEY_VIOLATION',
        message: refTable
          ? `Referenced "${refTable}" record not found`
          : `${columnRef} references a non-existent record`,
      };
    }

    case PgErrorCodes.CHECK_VIOLATION:
      return {
        code: 'CHECK_VIOLATION',
        message: `${columnRef} violates check constraint`,
      };

    case PgErrorCodes.INVALID_TEXT_REPRESENTATION:
      return {
        code: 'INVALID_FORMAT',
        message: `${columnRef} has invalid format`,
      };

    case PgErrorCodes.NUMERIC_VALUE_OUT_OF_RANGE:
      return {
        code: 'OUT_OF_RANGE',
        message: `${columnRef} value is out of range`,
      };

    case PgErrorCodes.STRING_DATA_RIGHT_TRUNCATION:
      return {
        code: 'STRING_TOO_LONG',
        message: `${columnRef} is too long`,
      };

    case PgErrorCodes.INVALID_DATETIME_FORMAT:
    case PgErrorCodes.DATETIME_FIELD_OVERFLOW:
      return {
        code: 'INVALID_DATE',
        message: `${columnRef} has invalid date/time format`,
      };

    case PgErrorCodes.EXCLUSION_VIOLATION:
      return {
        code: 'EXCLUSION_VIOLATION',
        message: `${columnRef} conflicts with existing data`,
      };

    default:
      // For unknown errors, return a generic message with the original error
      return {
        code: 'DATABASE_ERROR',
        message: detail || message || 'Database error occurred',
      };
  }
}

/**
 * Parse a PostgreSQL error object and return a ValidationError
 */
export function parsePgError(error: unknown): ValidationError {
  if (!error || typeof error !== 'object') {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };
  }

  const pgError = error as {
    code?: string;
    message?: string;
    detail?: string;
    constraint?: string;
    column?: string;
  };

  return mapPgErrorToValidation(
    pgError.code ?? '',
    pgError.message ?? 'Database error',
    pgError.detail,
    pgError.constraint,
  );
}

/**
 * Extract column name from a PostgreSQL error (if available)
 *
 * Useful for mapping backend errors back to specific cells
 */
export function getColumnFromPgError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const pgError = error as {
    code?: string;
    message?: string;
    detail?: string;
    constraint?: string;
    column?: string;
  };

  return extractColumnName({
    code: pgError.code ?? '',
    message: pgError.message ?? '',
    detail: pgError.detail,
    constraint: pgError.constraint,
    column: pgError.column,
  });
}
