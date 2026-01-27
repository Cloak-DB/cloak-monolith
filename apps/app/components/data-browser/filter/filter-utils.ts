import type { ColumnInfo, FilterOperator } from '@/lib/db-types';

// Operator display labels (more readable)
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: '=',
  neq: '\u2260', // ≠
  gt: '>',
  gte: '\u2265', // ≥
  lt: '<',
  lte: '\u2264', // ≤
  like: 'contains',
  ilike: 'contains',
  is_null: 'is empty',
  is_not_null: 'is set',
};

// Operators available per column type
export const OPERATORS_BY_TYPE: Record<string, FilterOperator[]> = {
  text: ['ilike', 'eq', 'neq', 'is_null', 'is_not_null'],
  varchar: ['ilike', 'eq', 'neq', 'is_null', 'is_not_null'],
  char: ['ilike', 'eq', 'neq', 'is_null', 'is_not_null'],
  integer: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  int4: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  int8: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  bigint: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  numeric: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  real: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  float4: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  float8: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  timestamp: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  timestamptz: [
    'eq',
    'neq',
    'gt',
    'gte',
    'lt',
    'lte',
    'is_null',
    'is_not_null',
  ],
  date: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'is_null', 'is_not_null'],
  boolean: ['eq', 'is_null', 'is_not_null'],
  bool: ['eq', 'is_null', 'is_not_null'],
  uuid: ['eq', 'neq', 'is_null', 'is_not_null'],
  json: ['is_null', 'is_not_null'],
  jsonb: ['is_null', 'is_not_null'],
};

export function getOperatorsForType(udtName: string): FilterOperator[] {
  return OPERATORS_BY_TYPE[udtName] ?? ['eq', 'neq', 'is_null', 'is_not_null'];
}

export function getDefaultOperatorForType(udtName: string): FilterOperator {
  // Default to 'ilike' (contains) for text types, 'eq' for others
  const operators = getOperatorsForType(udtName);
  if (operators.includes('ilike')) {
    return 'ilike';
  }
  return operators[0] as FilterOperator;
}

export function operatorNeedsValue(operator: FilterOperator): boolean {
  return operator !== 'is_null' && operator !== 'is_not_null';
}

// Special column name for "All columns" fuzzy search
export const ALL_COLUMNS_KEY = '__all__';

export interface AllColumnsOption {
  name: typeof ALL_COLUMNS_KEY;
  type: 'fuzzy';
  udtName: 'fuzzy';
  nullable: false;
  default: null;
  maxLength: null;
  precision: null;
  isPrimaryKey: false;
  foreignKey: null;
}

export const ALL_COLUMNS_OPTION: AllColumnsOption = {
  name: ALL_COLUMNS_KEY,
  type: 'fuzzy',
  udtName: 'fuzzy',
  nullable: false,
  default: null,
  maxLength: null,
  precision: null,
  isPrimaryKey: false,
  foreignKey: null,
};

export type ColumnOption = ColumnInfo | AllColumnsOption;

export function isAllColumnsOption(col: ColumnOption): col is AllColumnsOption {
  return col.name === ALL_COLUMNS_KEY;
}

export function getColumnDisplayName(col: ColumnOption): string {
  if (isAllColumnsOption(col)) {
    return 'All columns';
  }
  return col.name;
}
