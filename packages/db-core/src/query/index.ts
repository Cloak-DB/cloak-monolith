/**
 * Query service for executing raw SQL queries
 */
import { getPool } from '../shared/pool';
import { createError, ErrorCodes } from '../shared/errors';

export interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  fields: QueryField[];
  executionTimeMs: number;
  wasLimited: boolean;
  limit: number;
}

export interface QueryField {
  name: string;
  dataTypeID: number;
  dataTypeName: string;
}

// Map PostgreSQL OIDs to type names
const pgTypeNames: Record<number, string> = {
  16: 'boolean',
  17: 'bytea',
  18: 'char',
  19: 'name',
  20: 'int8',
  21: 'int2',
  23: 'int4',
  25: 'text',
  26: 'oid',
  114: 'json',
  142: 'xml',
  600: 'point',
  700: 'float4',
  701: 'float8',
  790: 'money',
  829: 'macaddr',
  869: 'inet',
  650: 'cidr',
  1000: '_bool',
  1005: '_int2',
  1007: '_int4',
  1009: '_text',
  1014: '_char',
  1015: '_varchar',
  1016: '_int8',
  1021: '_float4',
  1022: '_float8',
  1042: 'bpchar',
  1043: 'varchar',
  1082: 'date',
  1083: 'time',
  1114: 'timestamp',
  1184: 'timestamptz',
  1186: 'interval',
  1266: 'timetz',
  1560: 'bit',
  1562: 'varbit',
  1700: 'numeric',
  2950: 'uuid',
  3802: 'jsonb',
};

function getTypeName(dataTypeID: number): string {
  return pgTypeNames[dataTypeID] || `unknown(${dataTypeID})`;
}

// Maximum rows to return to prevent browser crash
const MAX_QUERY_ROWS = 500;

/**
 * Wrap SELECT queries with LIMIT to prevent browser crash
 * Wraps in subquery to preserve ORDER BY
 */
function wrapSelectWithLimit(sql: string, limit: number): string {
  const normalized = sql.trim().toLowerCase();

  // Only wrap SELECT queries
  if (!normalized.startsWith('select') && !normalized.startsWith('with')) {
    return sql;
  }

  // If user already specified a limit, don't override
  if (normalized.includes(' limit ')) {
    return sql;
  }

  // Wrap in subquery to preserve ORDER BY and add limit
  const cleanedSql = sql.trim().replace(/;$/, '');
  return `SELECT * FROM (${cleanedSql}) AS _limited_query LIMIT ${limit}`;
}

/**
 * Execute a raw SQL query
 * WARNING: This executes arbitrary SQL - use with caution!
 */
export async function executeQuery(sql: string): Promise<QueryResult> {
  const pool = getPool();

  if (!pool) {
    throw createError(ErrorCodes.NOT_CONNECTED, 'Not connected to database');
  }

  // Basic SQL injection protection - block dangerous statements
  const normalizedSql = sql.trim().toLowerCase();
  const dangerousPatterns = [
    /^drop\s+database/i,
    /^drop\s+role/i,
    /^drop\s+user/i,
    /^create\s+role/i,
    /^create\s+user/i,
    /^alter\s+role/i,
    /^alter\s+user/i,
    /^grant\s+/i,
    /^revoke\s+/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(normalizedSql)) {
      throw createError(
        ErrorCodes.QUERY_ERROR,
        'This query type is not allowed for security reasons',
      );
    }
  }

  const startTime = Date.now();

  try {
    // Wrap query with limit + 1 to detect if results were truncated
    const wrappedSql = wrapSelectWithLimit(sql, MAX_QUERY_ROWS + 1);
    const result = await pool.query(wrappedSql);
    const executionTimeMs = Date.now() - startTime;

    // Handle different result types (SELECT vs INSERT/UPDATE/DELETE)
    let rows = result.rows ?? [];
    const fields: QueryField[] = (result.fields ?? []).map((f) => ({
      name: f.name,
      dataTypeID: f.dataTypeID,
      dataTypeName: getTypeName(f.dataTypeID),
    }));

    // Check if results were truncated
    const wasLimited = rows.length > MAX_QUERY_ROWS;
    if (wasLimited) {
      rows = rows.slice(0, MAX_QUERY_ROWS);
    }

    // Use rows.length after slicing to show actual returned count (not the 501 from LIMIT detection)
    const rowCount = rows.length;

    return {
      rows,
      rowCount,
      fields,
      executionTimeMs,
      wasLimited,
      limit: MAX_QUERY_ROWS,
    };
  } catch (err) {
    const error = err as Error & {
      code?: string;
      position?: string;
      detail?: string;
    };

    // Provide helpful error messages
    let message = error.message;
    if (error.position) {
      message += ` (at position ${error.position})`;
    }
    if (error.detail) {
      message += `: ${error.detail}`;
    }

    throw createError(ErrorCodes.QUERY_ERROR, message);
  }
}

/**
 * Execute a read-only query (SELECT only)
 */
export async function executeReadOnlyQuery(sql: string): Promise<QueryResult> {
  const normalizedSql = sql.trim().toLowerCase();

  // Only allow SELECT, WITH (for CTEs), and EXPLAIN
  if (
    !normalizedSql.startsWith('select') &&
    !normalizedSql.startsWith('with') &&
    !normalizedSql.startsWith('explain')
  ) {
    throw createError(
      ErrorCodes.QUERY_ERROR,
      'Only SELECT queries are allowed in read-only mode',
    );
  }

  return executeQuery(sql);
}
