/**
 * Client-safe SQL utility functions
 * These functions don't require any Node.js-specific modules
 */

// Local type definitions to avoid importing from db-core (which pulls in pg)
type FilterOperator =
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

function quoteIdentifier(identifier: string): string {
  // Escape double quotes by doubling them
  return `"${identifier.replace(/"/g, '""')}"`;
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
