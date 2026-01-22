/**
 * Client-side validation for cell values
 *
 * Validates values against column constraints before committing changes.
 * Invalid values are allowed into pending changes but marked with errors.
 */

import type { ColumnInfo } from '@/lib/db-types';

/**
 * Validation error returned when a value fails validation
 */
export interface ValidationError {
  code: string;
  message: string;
}

/**
 * Result of validating a cell value
 */
export interface ValidationResult {
  valid: boolean;
  error?: ValidationError;
}

/**
 * Error codes for validation errors
 */
export const ValidationErrorCodes = {
  NULL_NOT_ALLOWED: 'NULL_NOT_ALLOWED',
  INVALID_INTEGER: 'INVALID_INTEGER',
  INVALID_NUMBER: 'INVALID_NUMBER',
  INVALID_JSON: 'INVALID_JSON',
  STRING_TOO_LONG: 'STRING_TOO_LONG',
  INVALID_BOOLEAN: 'INVALID_BOOLEAN',
} as const;

/**
 * Check if a column allows null values
 */
function allowsNull(column: ColumnInfo): boolean {
  // Nullable columns always allow null
  if (column.nullable) return true;

  // Columns with defaults can be null (DB will provide the value)
  if (column.default) return true;

  return false;
}

/**
 * Check if a value is null or undefined (true database NULL)
 * Note: Empty string '' is a valid string value, not NULL
 */
function isNull(value: unknown): boolean {
  return value === null || value === undefined;
}

/**
 * Check if a value is "empty input" for type coercion purposes
 * Empty/whitespace strings are treated as "no input" for non-string types
 */
function isEmptyInput(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

/**
 * Validate that non-nullable columns have a value
 * Note: Empty string '' is a valid value for string columns
 */
function validateNotNull(column: ColumnInfo, value: unknown): ValidationResult {
  // Only null/undefined violate NOT NULL - empty string is a valid string value
  if (isNull(value) && !allowsNull(column)) {
    return {
      valid: false,
      error: {
        code: ValidationErrorCodes.NULL_NOT_ALLOWED,
        message: `"${column.name}" cannot be NULL`,
      },
    };
  }
  return { valid: true };
}

/**
 * Validate integer values
 */
function validateInteger(column: ColumnInfo, value: unknown): ValidationResult {
  // Empty input (null, undefined, or empty string) skips type validation
  // The NOT NULL check handles whether null is allowed
  if (isEmptyInput(value)) return { valid: true };

  // If already a number, check if it's an integer
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      return {
        valid: false,
        error: {
          code: ValidationErrorCodes.INVALID_INTEGER,
          message: `"${column.name}" must be a whole number`,
        },
      };
    }
    return { valid: true };
  }

  // If string, try to parse
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return { valid: true }; // Empty handled by validateNotNull

    const num = Number(trimmed);
    if (isNaN(num) || !Number.isInteger(num)) {
      return {
        valid: false,
        error: {
          code: ValidationErrorCodes.INVALID_INTEGER,
          message: `"${column.name}" must be a whole number`,
        },
      };
    }
    return { valid: true };
  }

  return {
    valid: false,
    error: {
      code: ValidationErrorCodes.INVALID_INTEGER,
      message: `"${column.name}" must be a whole number`,
    },
  };
}

/**
 * Validate float/decimal values
 */
function validateNumber(column: ColumnInfo, value: unknown): ValidationResult {
  // Empty values are handled by validateNotNull
  if (isEmptyInput(value)) return { valid: true };

  // If already a number, it's valid
  if (typeof value === 'number' && !isNaN(value)) {
    return { valid: true };
  }

  // If string, try to parse
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return { valid: true }; // Empty handled by validateNotNull

    const num = parseFloat(trimmed);
    if (isNaN(num)) {
      return {
        valid: false,
        error: {
          code: ValidationErrorCodes.INVALID_NUMBER,
          message: `"${column.name}" must be a number`,
        },
      };
    }
    return { valid: true };
  }

  return {
    valid: false,
    error: {
      code: ValidationErrorCodes.INVALID_NUMBER,
      message: `"${column.name}" must be a number`,
    },
  };
}

/**
 * Validate JSON/JSONB values
 */
function validateJSON(column: ColumnInfo, value: unknown): ValidationResult {
  // Empty values are handled by validateNotNull
  if (isEmptyInput(value)) return { valid: true };

  // If already an object/array, it's valid JSON
  if (typeof value === 'object') {
    return { valid: true };
  }

  // If string, try to parse as JSON
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return { valid: true }; // Empty handled by validateNotNull

    try {
      JSON.parse(trimmed);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: {
          code: ValidationErrorCodes.INVALID_JSON,
          message: `Invalid JSON in "${column.name}"`,
        },
      };
    }
  }

  // Other types (numbers, booleans) are valid JSON primitives
  return { valid: true };
}

/**
 * Validate string length
 */
function validateStringLength(
  column: ColumnInfo,
  value: unknown,
): ValidationResult {
  // Empty values are handled by validateNotNull
  if (isEmptyInput(value)) return { valid: true };

  // Only validate if maxLength is set
  if (column.maxLength === null) return { valid: true };

  const str = String(value);
  if (str.length > column.maxLength) {
    return {
      valid: false,
      error: {
        code: ValidationErrorCodes.STRING_TOO_LONG,
        message: `"${column.name}" exceeds max length (${column.maxLength})`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validate boolean values
 */
function validateBoolean(column: ColumnInfo, value: unknown): ValidationResult {
  // Empty values are handled by validateNotNull
  if (isEmptyInput(value)) return { valid: true };

  // If already a boolean, it's valid
  if (typeof value === 'boolean') {
    return { valid: true };
  }

  // Accept string representations
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (['true', 'false', 't', 'f', '1', '0', 'yes', 'no'].includes(lower)) {
      return { valid: true };
    }
  }

  // Accept numeric representations
  if (typeof value === 'number') {
    if (value === 0 || value === 1) {
      return { valid: true };
    }
  }

  return {
    valid: false,
    error: {
      code: ValidationErrorCodes.INVALID_BOOLEAN,
      message: `"${column.name}" must be true or false`,
    },
  };
}

/**
 * PostgreSQL integer types
 */
const INTEGER_TYPES = [
  'int2',
  'int4',
  'int8',
  'smallint',
  'integer',
  'bigint',
  'smallserial',
  'serial',
  'bigserial',
];

/**
 * PostgreSQL float/decimal types
 */
const FLOAT_TYPES = [
  'float4',
  'float8',
  'real',
  'double precision',
  'numeric',
  'decimal',
  'money',
];

/**
 * PostgreSQL JSON types
 */
const JSON_TYPES = ['json', 'jsonb'];

/**
 * PostgreSQL boolean types
 */
const BOOLEAN_TYPES = ['bool', 'boolean'];

/**
 * PostgreSQL string types
 */
const STRING_TYPES = [
  'varchar',
  'char',
  'character varying',
  'character',
  'text',
  'bpchar',
];

/**
 * Validate a cell value against column constraints
 *
 * @param column - The column info with constraints
 * @param value - The value to validate
 * @returns Validation result with error if invalid
 */
export function validateCellValue(
  column: ColumnInfo,
  value: unknown,
): ValidationResult {
  // First, check not-null constraint
  const nullCheck = validateNotNull(column, value);
  if (!nullCheck.valid) return nullCheck;

  // Get the base type (udtName is the underlying type)
  const type = column.udtName.toLowerCase();

  // Type-specific validation
  if (INTEGER_TYPES.includes(type)) {
    const intCheck = validateInteger(column, value);
    if (!intCheck.valid) return intCheck;
  } else if (FLOAT_TYPES.includes(type)) {
    const numCheck = validateNumber(column, value);
    if (!numCheck.valid) return numCheck;
  } else if (JSON_TYPES.includes(type)) {
    const jsonCheck = validateJSON(column, value);
    if (!jsonCheck.valid) return jsonCheck;
  } else if (BOOLEAN_TYPES.includes(type)) {
    const boolCheck = validateBoolean(column, value);
    if (!boolCheck.valid) return boolCheck;
  } else if (STRING_TYPES.includes(type)) {
    const lengthCheck = validateStringLength(column, value);
    if (!lengthCheck.valid) return lengthCheck;
  }

  return { valid: true };
}
