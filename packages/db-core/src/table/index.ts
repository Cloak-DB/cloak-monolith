/**
 * Table CRUD operations service
 *
 * Provides functions for reading and manipulating table data.
 */

import { getPool } from '../shared/pool';
import { createError, ErrorCodes } from '../shared/errors';
import type {
  GetRowsOptions,
  GetRowsResult,
  GetRowResult,
  MutationResult,
  DeleteResult,
  RowData,
  PrimaryKey,
  Filter,
  FilterOperator,
} from './table.types';

export * from './table.types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;

const OPERATOR_SQL: Record<FilterOperator, string> = {
  eq: '=',
  neq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'LIKE',
  ilike: 'ILIKE',
  is_null: 'IS NULL',
  is_not_null: 'IS NOT NULL',
};

// ============================================================================
// Helpers
// ============================================================================

function ensureConnected(): void {
  const pool = getPool();
  if (!pool) {
    throw createError(ErrorCodes.NOT_CONNECTED, 'Not connected to a database');
  }
}

function quoteIdentifier(identifier: string): string {
  // Escape double quotes by doubling them
  return `"${identifier.replace(/"/g, '""')}"`;
}

function buildWhereClause(
  filters: Filter[],
  startParamIndex: number,
): { sql: string; values: unknown[] } {
  if (filters.length === 0) {
    return { sql: '', values: [] };
  }

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = startParamIndex;

  for (const filter of filters) {
    const column = quoteIdentifier(filter.column);
    const operator = OPERATOR_SQL[filter.operator];

    if (filter.operator === 'is_null' || filter.operator === 'is_not_null') {
      conditions.push(`${column} ${operator}`);
    } else if (filter.operator === 'like' || filter.operator === 'ilike') {
      conditions.push(`${column} ${operator} $${paramIndex}`);
      values.push(`%${filter.value}%`);
      paramIndex++;
    } else {
      conditions.push(`${column} ${operator} $${paramIndex}`);
      values.push(filter.value);
      paramIndex++;
    }
  }

  return {
    sql: `WHERE ${conditions.join(' AND ')}`,
    values,
  };
}

/**
 * Generate a human-readable SQL SELECT query string
 * Used for "Copy SQL" feature - includes WHERE and ORDER BY but NOT LIMIT/OFFSET
 */
export function generateSelectSQL(
  schema: string,
  table: string,
  options: {
    filters?: Filter[];
    orderBy?: { column: string; direction: 'asc' | 'desc' };
  } = {},
): string {
  const tableName = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
  const filters = options.filters ?? [];

  let sql = `SELECT * FROM ${tableName}`;

  // Build WHERE clause (with actual values inlined for readability)
  if (filters.length > 0) {
    const conditions: string[] = [];

    for (const filter of filters) {
      const column = quoteIdentifier(filter.column);
      const operator = OPERATOR_SQL[filter.operator];

      if (filter.operator === 'is_null' || filter.operator === 'is_not_null') {
        conditions.push(`${column} ${operator}`);
      } else if (filter.operator === 'like' || filter.operator === 'ilike') {
        const escapedValue = String(filter.value).replace(/'/g, "''");
        conditions.push(`${column} ${operator} '%${escapedValue}%'`);
      } else if (typeof filter.value === 'string') {
        const escapedValue = filter.value.replace(/'/g, "''");
        conditions.push(`${column} ${operator} '${escapedValue}'`);
      } else if (typeof filter.value === 'boolean') {
        conditions.push(`${column} ${operator} ${filter.value}`);
      } else {
        conditions.push(`${column} ${operator} ${filter.value}`);
      }
    }

    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Build ORDER BY clause
  if (options.orderBy) {
    const direction = options.orderBy.direction.toUpperCase();
    sql += ` ORDER BY ${quoteIdentifier(options.orderBy.column)} ${direction}`;
  }

  return sql;
}

function buildPrimaryKeyClause(
  primaryKey: PrimaryKey,
  startParamIndex: number,
): { sql: string; values: unknown[] } {
  const columns = Object.keys(primaryKey);
  if (columns.length === 0) {
    throw createError(
      ErrorCodes.INVALID_CONNECTION_STRING,
      'Primary key cannot be empty',
    );
  }

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = startParamIndex;

  for (const column of columns) {
    conditions.push(`${quoteIdentifier(column)} = $${paramIndex}`);
    values.push(primaryKey[column]);
    paramIndex++;
  }

  return {
    sql: `WHERE ${conditions.join(' AND ')}`,
    values,
  };
}

// ============================================================================
// Primary Key Detection
// ============================================================================

/**
 * Get primary key columns for a table
 */
export async function getPrimaryKeyColumns(
  schema: string,
  table: string,
): Promise<string[]> {
  ensureConnected();
  const pool = getPool()!;

  const result = await pool.query<{ column_name: string }>(
    `
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = $1
      AND tc.table_name = $2
      AND tc.constraint_type = 'PRIMARY KEY'
    ORDER BY kcu.ordinal_position
    `,
    [schema, table],
  );

  return result.rows.map((row) => row.column_name);
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get rows from a table with pagination, sorting, and filtering
 */
export async function getRows(
  schema: string,
  table: string,
  options: GetRowsOptions = {},
): Promise<GetRowsResult> {
  ensureConnected();
  const pool = getPool()!;

  const limit = Math.min(options.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = options.offset ?? 0;
  const filters = options.filters ?? [];

  const tableName = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;

  // Build WHERE clause
  const { sql: whereClause, values: whereValues } = buildWhereClause(
    filters,
    1,
  );

  // Build ORDER BY clause
  let orderByClause = '';
  if (options.orderBy) {
    const direction = options.orderBy.direction.toUpperCase();
    orderByClause = `ORDER BY ${quoteIdentifier(options.orderBy.column)} ${direction}`;
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
  const countResult = await pool.query<{ count: string }>(
    countQuery,
    whereValues,
  );
  const totalCount = parseInt(countResult.rows[0].count, 10);

  // Get rows
  const nextParamIndex = whereValues.length + 1;
  const dataQuery = `
    SELECT *
    FROM ${tableName}
    ${whereClause}
    ${orderByClause}
    LIMIT $${nextParamIndex} OFFSET $${nextParamIndex + 1}
  `;
  const dataResult = await pool.query(dataQuery, [
    ...whereValues,
    limit,
    offset,
  ]);

  return {
    rows: dataResult.rows,
    totalCount,
    hasMore: offset + dataResult.rows.length < totalCount,
  };
}

/**
 * Get all rows from a table (up to a limit) for full-table search
 * Used for client-side fuzzy search across entire table
 */
export async function getAllRows(
  schema: string,
  table: string,
  options: {
    limit?: number;
    filters?: Filter[];
    orderBy?: { column: string; direction: 'asc' | 'desc' };
  } = {},
): Promise<{
  rows: Record<string, unknown>[];
  totalCount: number;
  limited: boolean;
}> {
  ensureConnected();
  const pool = getPool()!;

  const maxRows = options.limit ?? 10000;
  const filters = options.filters ?? [];
  const tableName = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;

  // Build WHERE clause
  const { sql: whereClause, values: whereValues } = buildWhereClause(
    filters,
    1,
  );

  // Build ORDER BY clause
  let orderByClause = '';
  if (options.orderBy) {
    const direction = options.orderBy.direction.toUpperCase();
    orderByClause = `ORDER BY ${quoteIdentifier(options.orderBy.column)} ${direction}`;
  }

  // Get total count first
  const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${whereClause}`;
  const countResult = await pool.query<{ count: string }>(
    countQuery,
    whereValues,
  );
  const totalCount = parseInt(countResult.rows[0].count, 10);

  // Get rows (up to limit)
  const nextParamIndex = whereValues.length + 1;
  const dataQuery = `
    SELECT *
    FROM ${tableName}
    ${whereClause}
    ${orderByClause}
    LIMIT $${nextParamIndex}
  `;
  const dataResult = await pool.query(dataQuery, [...whereValues, maxRows]);

  return {
    rows: dataResult.rows,
    totalCount,
    limited: totalCount > maxRows,
  };
}

/**
 * Get a single row by primary key
 */
export async function getRow(
  schema: string,
  table: string,
  primaryKey: PrimaryKey,
): Promise<GetRowResult> {
  ensureConnected();
  const pool = getPool()!;

  const tableName = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
  const { sql: whereClause, values } = buildPrimaryKeyClause(primaryKey, 1);

  const query = `SELECT * FROM ${tableName} ${whereClause} LIMIT 1`;
  const result = await pool.query(query, values);

  return {
    row: result.rows[0] ?? null,
  };
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create a new row in a table
 */
export async function createRow(
  schema: string,
  table: string,
  data: RowData,
): Promise<MutationResult> {
  ensureConnected();
  const pool = getPool()!;

  const columns = Object.keys(data);
  if (columns.length === 0) {
    return { success: false, error: 'No data provided' };
  }

  const tableName = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
  const columnList = columns.map(quoteIdentifier).join(', ');
  const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const values = columns.map((col) => data[col]);

  const query = `
    INSERT INTO ${tableName} (${columnList})
    VALUES (${valuePlaceholders})
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return {
      success: true,
      row: result.rows[0],
    };
  } catch (err) {
    const error = err as Error & { code?: string; detail?: string };
    return {
      success: false,
      error: error.detail || error.message,
    };
  }
}

/**
 * Update an existing row by primary key
 */
export async function updateRow(
  schema: string,
  table: string,
  primaryKey: PrimaryKey,
  data: RowData,
): Promise<MutationResult> {
  ensureConnected();
  const pool = getPool()!;

  const columns = Object.keys(data);
  if (columns.length === 0) {
    return { success: false, error: 'No data provided' };
  }

  const tableName = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;

  // Build SET clause
  const setClause = columns
    .map((col, i) => `${quoteIdentifier(col)} = $${i + 1}`)
    .join(', ');
  const setValues = columns.map((col) => data[col]);

  // Build WHERE clause for primary key
  const { sql: whereClause, values: whereValues } = buildPrimaryKeyClause(
    primaryKey,
    columns.length + 1,
  );

  const query = `
    UPDATE ${tableName}
    SET ${setClause}
    ${whereClause}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [...setValues, ...whereValues]);
    if (result.rows.length === 0) {
      return { success: false, error: 'Row not found' };
    }
    return {
      success: true,
      row: result.rows[0],
    };
  } catch (err) {
    const error = err as Error & { code?: string; detail?: string };
    return {
      success: false,
      error: error.detail || error.message,
    };
  }
}

/**
 * Delete a row by primary key
 */
export async function deleteRow(
  schema: string,
  table: string,
  primaryKey: PrimaryKey,
): Promise<DeleteResult> {
  ensureConnected();
  const pool = getPool()!;

  const tableName = `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
  const { sql: whereClause, values } = buildPrimaryKeyClause(primaryKey, 1);

  const query = `DELETE FROM ${tableName} ${whereClause}`;

  try {
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return { success: false, error: 'Row not found' };
    }
    return { success: true };
  } catch (err) {
    const error = err as Error & { code?: string; detail?: string };
    return {
      success: false,
      error: error.detail || error.message,
    };
  }
}
