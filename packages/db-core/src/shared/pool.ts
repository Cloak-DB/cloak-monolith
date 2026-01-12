import type { Pool } from 'pg';

/**
 * Module-level singleton for the active database connection pool.
 * Only one connection at a time is supported in v1.
 */
let activePool: Pool | null = null;

/**
 * Connection metadata stored alongside the pool
 */
interface ConnectionInfo {
  host: string;
  port: number;
  database: string;
  user: string;
}

let connectionInfo: ConnectionInfo | null = null;

/**
 * Get the active connection pool
 */
export function getPool(): Pool | null {
  return activePool;
}

/**
 * Set the active connection pool
 */
export function setPool(pool: Pool | null, info: ConnectionInfo | null): void {
  activePool = pool;
  connectionInfo = info;
}

/**
 * Get connection info for the active pool
 */
export function getConnectionInfo(): ConnectionInfo | null {
  return connectionInfo;
}

/**
 * Check if there is an active connection
 */
export function isConnected(): boolean {
  return activePool !== null;
}
