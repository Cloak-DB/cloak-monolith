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
