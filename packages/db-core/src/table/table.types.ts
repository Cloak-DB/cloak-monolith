/**
 * Table service type definitions
 */

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

export interface GetRowsOptions {
  limit?: number;
  offset?: number;
  orderBy?: OrderBy;
  filters?: Filter[];
}

export interface RowData {
  [column: string]: unknown;
}

export interface GetRowsResult {
  rows: RowData[];
  totalCount: number;
  hasMore: boolean;
}

export interface GetRowResult {
  row: RowData | null;
}

export interface MutationResult {
  success: boolean;
  row?: RowData;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export type PrimaryKey = Record<string, unknown>;

/**
 * Result of a batch save operation (atomic transaction)
 */
export interface BatchSaveResult {
  success: boolean;
  /** Index of the failed operation (0-based) if any */
  failedIndex?: number;
  /** Type of the failed operation */
  failedType?: 'create' | 'update';
  /** Column that caused the error (if determinable) */
  failedColumn?: string;
  /** PostgreSQL error code */
  errorCode?: string;
  /** User-friendly error message */
  error?: string;
  /** Raw error detail from PostgreSQL */
  errorDetail?: string;
}
