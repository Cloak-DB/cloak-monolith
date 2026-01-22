/**
 * Schema introspection service
 *
 * Provides functions for database introspection using information_schema and pg_catalog.
 */

import { getPool } from '../shared/pool';
import { createError, ErrorCodes, type DbError } from '../shared/errors';

// ============================================================================
// Types
// ============================================================================

export interface SchemaInfo {
  name: string;
}

export interface TableInfo {
  name: string;
  type: string;
  rowCount: number | null;
}

export interface ColumnInfo {
  name: string;
  type: string;
  udtName: string;
  nullable: boolean;
  default: string | null;
  maxLength: number | null;
  precision: number | null;
  isPrimaryKey: boolean;
  foreignKey: {
    schema: string;
    table: string;
    column: string;
  } | null;
}

export interface RelationshipInfo {
  column: string;
  foreignSchema: string;
  foreignTable: string;
  foreignColumn: string;
}

export interface IndexInfo {
  name: string;
  definition: string;
}

// ============================================================================
// Helper
// ============================================================================

function ensureConnected(): void {
  const pool = getPool();
  if (!pool) {
    throw createError(ErrorCodes.NOT_CONNECTED, 'Not connected to a database');
  }
}

// ============================================================================
// Schema Functions
// ============================================================================

/**
 * List all schemas in the database (excluding system schemas)
 */
export async function getSchemas(): Promise<{ schemas: SchemaInfo[] }> {
  ensureConnected();
  const pool = getPool()!;

  const result = await pool.query<{ schema_name: string }>(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY schema_name
  `);

  return {
    schemas: result.rows.map((row) => ({ name: row.schema_name })),
  };
}

/**
 * List all tables in a schema with row counts
 */
export async function getTables(
  schema: string,
): Promise<{ tables: TableInfo[] }> {
  ensureConnected();
  const pool = getPool()!;

  const result = await pool.query<{
    table_name: string;
    table_type: string;
    row_count: string | null;
  }>(
    `
    SELECT
      t.table_name,
      t.table_type,
      (SELECT reltuples::bigint FROM pg_class c
       JOIN pg_namespace n ON c.relnamespace = n.oid
       WHERE c.relname = t.table_name AND n.nspname = t.table_schema) as row_count
    FROM information_schema.tables t
    WHERE t.table_schema = $1
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name
    `,
    [schema],
  );

  return {
    tables: result.rows.map((row) => {
      // reltuples can be -1 for tables that haven't been analyzed yet
      // Return null for unknown counts to avoid showing misleading data
      const parsedCount = row.row_count ? parseInt(row.row_count, 10) : null;
      return {
        name: row.table_name,
        type: row.table_type,
        rowCount: parsedCount !== null && parsedCount >= 0 ? parsedCount : null,
      };
    }),
  };
}

/**
 * Get columns for a specific table with primary key and foreign key info
 */
export async function getColumns(
  schema: string,
  table: string,
): Promise<{ columns: ColumnInfo[] }> {
  ensureConnected();
  const pool = getPool()!;

  // Get column info
  const columnsResult = await pool.query<{
    column_name: string;
    data_type: string;
    udt_name: string;
    is_nullable: string;
    column_default: string | null;
    character_maximum_length: number | null;
    numeric_precision: number | null;
  }>(
    `
    SELECT
      column_name,
      data_type,
      udt_name,
      is_nullable,
      column_default,
      character_maximum_length,
      numeric_precision
    FROM information_schema.columns
    WHERE table_schema = $1 AND table_name = $2
    ORDER BY ordinal_position
    `,
    [schema, table],
  );

  // Get primary keys
  const pkResult = await pool.query<{ column_name: string }>(
    `
    SELECT kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = $1
      AND tc.table_name = $2
      AND tc.constraint_type = 'PRIMARY KEY'
    `,
    [schema, table],
  );

  const primaryKeys = new Set(pkResult.rows.map((row) => row.column_name));

  // Get foreign keys
  const fkResult = await pool.query<{
    column_name: string;
    foreign_table_schema: string;
    foreign_table_name: string;
    foreign_column_name: string;
  }>(
    `
    SELECT
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema = $1
      AND tc.table_name = $2
      AND tc.constraint_type = 'FOREIGN KEY'
    `,
    [schema, table],
  );

  const foreignKeys = new Map(
    fkResult.rows.map((row) => [
      row.column_name,
      {
        schema: row.foreign_table_schema,
        table: row.foreign_table_name,
        column: row.foreign_column_name,
      },
    ]),
  );

  return {
    columns: columnsResult.rows.map((row) => ({
      name: row.column_name,
      type: row.data_type,
      udtName: row.udt_name,
      nullable: row.is_nullable === 'YES',
      default: row.column_default,
      maxLength: row.character_maximum_length,
      precision: row.numeric_precision,
      isPrimaryKey: primaryKeys.has(row.column_name),
      foreignKey: foreignKeys.get(row.column_name) ?? null,
    })),
  };
}

/**
 * Get foreign key relationships for a table
 */
export async function getRelationships(
  schema: string,
  table: string,
): Promise<{ relationships: RelationshipInfo[] }> {
  ensureConnected();
  const pool = getPool()!;

  const result = await pool.query<{
    column_name: string;
    foreign_table_schema: string;
    foreign_table_name: string;
    foreign_column_name: string;
  }>(
    `
    SELECT
      kcu.column_name,
      ccu.table_schema AS foreign_table_schema,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema = $1
      AND tc.table_name = $2
      AND tc.constraint_type = 'FOREIGN KEY'
    `,
    [schema, table],
  );

  return {
    relationships: result.rows.map((row) => ({
      column: row.column_name,
      foreignSchema: row.foreign_table_schema,
      foreignTable: row.foreign_table_name,
      foreignColumn: row.foreign_column_name,
    })),
  };
}

/**
 * Get indexes for a table
 */
export async function getIndexes(
  schema: string,
  table: string,
): Promise<{ indexes: IndexInfo[] }> {
  ensureConnected();
  const pool = getPool()!;

  const result = await pool.query<{
    indexname: string;
    indexdef: string;
  }>(
    `
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = $1 AND tablename = $2
    ORDER BY indexname
    `,
    [schema, table],
  );

  return {
    indexes: result.rows.map((row) => ({
      name: row.indexname,
      definition: row.indexdef,
    })),
  };
}
