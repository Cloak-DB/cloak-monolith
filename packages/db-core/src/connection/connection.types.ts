import type { DbError } from '../shared/errors';

/**
 * Connection error with user-friendly messaging
 */
export interface ConnectionError extends DbError {
  code: string;
  message: string;
  details?: string;
  suggestion?: string;
}

/**
 * Result of parsing a connection string
 */
export interface ParsedConnectionString {
  host: string;
  port: number;
  database: string;
  user: string;
}

/**
 * Result of connection string validation
 */
export type ValidationResult =
  | {
      valid: true;
      parsed: ParsedConnectionString;
    }
  | {
      valid: false;
      error: ConnectionError;
    };

/**
 * Result of a connection attempt
 */
export type ConnectionResult =
  | {
      success: true;
      host: string;
      port: number;
      database: string;
      user: string;
    }
  | {
      success: false;
      error: ConnectionError;
    };

/**
 * Result of a test connection attempt
 */
export type TestConnectionResult =
  | { success: true }
  | { success: false; error: ConnectionError };

/**
 * Current connection status
 */
export interface ConnectionStatus {
  connected: boolean;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
}
