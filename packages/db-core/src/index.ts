/**
 * @cloak-db/db-core
 *
 * Core database logic for Cloak DB.
 * Provides services for connection management, schema introspection,
 * query execution, and table CRUD operations.
 */

// Connection service
export {
  testConnection,
  connect,
  disconnect,
  getStatus,
  validatePostgresConnectionString,
  mapPgError,
  createConnectionError,
} from './connection';

export type {
  SSLConfig,
  ConnectionError,
  ConnectionResult,
  TestConnectionResult,
  ConnectionStatus,
  ParsedConnectionString,
  ValidationResult,
} from './connection';

// Shared types and utilities
export {
  ErrorCodes,
  createError,
  isSchemaError,
  getSchemaErrorDescription,
  PG_SCHEMA_ERROR_CODES,
} from './shared/errors';
export type { DbError, ErrorCode } from './shared/errors';
export { getPool, isConnected } from './shared/pool';

// Config service
export {
  getConfigDir,
  getConfigPath,
  getDefaultConfig,
  ensureConfigDir,
  readConfig,
  writeConfig,
  saveConnection,
  deleteConnection,
  setDefaultConnection,
  updatePreferences,
} from './config';

export type { Config, SavedConnection, AppPreferences } from './config';

export {
  ConfigSchema,
  SavedConnectionSchema,
  AppPreferencesSchema,
  SSLConfigSchema,
} from './config';

// Schema service
export {
  getSchemas,
  getTables,
  getColumns,
  getRelationships,
  getIndexes,
} from './schema';

export type {
  SchemaInfo,
  TableInfo,
  ColumnInfo,
  RelationshipInfo,
  IndexInfo,
} from './schema';

// Query service
export { executeQuery, executeReadOnlyQuery } from './query';
export type { QueryResult, QueryField } from './query';

// Table service
export {
  getRows,
  getRow,
  getAllRows,
  createRow,
  updateRow,
  deleteRow,
  saveBatch,
  getPrimaryKeyColumns,
  generateSelectSQL,
} from './table';

export type {
  GetRowsOptions,
  GetRowsResult,
  GetRowResult,
  MutationResult,
  DeleteResult,
  BatchSaveResult,
  RowData,
  PrimaryKey,
  Filter,
  FilterOperator,
  OrderBy,
} from './table';
