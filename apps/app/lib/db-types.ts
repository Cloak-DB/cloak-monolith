/**
 * Client-safe type definitions for database operations
 *
 * These are copies of types from @cloak-db/db-core that can be safely
 * imported in client components without pulling in Node.js dependencies.
 */

// Filter types
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is_null'
  | 'is_not_null';

export interface Filter {
  column: string;
  operator: FilterOperator;
  value?: unknown;
}

export interface OrderBy {
  column: string;
  direction: 'asc' | 'desc';
}

// Column/Schema types
export interface ForeignKeyInfo {
  schema: string;
  table: string;
  column: string;
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
  foreignKey: ForeignKeyInfo | null;
}

export interface IndexInfo {
  name: string;
  definition: string;
}

export interface TableInfo {
  name: string;
  rowCount: number;
}

export interface SchemaInfo {
  name: string;
}
