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
  ConnectionError,
  ConnectionResult,
  TestConnectionResult,
  ConnectionStatus,
  ParsedConnectionString,
  ValidationResult,
} from './connection';

// Shared types and utilities
export { ErrorCodes } from './shared/errors';
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
} from './config';

// Schema service (placeholder)
// export * from './schema';

// Query service (placeholder)
// export * from './query';

// Table service (placeholder)
// export * from './table';
