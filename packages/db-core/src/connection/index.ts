// Service functions
export {
  testConnection,
  connect,
  disconnect,
  getStatus,
} from './connection.service';

// Types
export type {
  SSLConfig,
  ConnectionError,
  ConnectionResult,
  TestConnectionResult,
  ConnectionStatus,
  ParsedConnectionString,
  ValidationResult,
} from './connection.types';

// Utilities (for advanced usage)
export { validatePostgresConnectionString } from './connection.validator';
export { mapPgError, createConnectionError } from './connection.errors';
