import { Pool } from 'pg';
import { ErrorCodes } from '../shared/errors';
import {
  getPool,
  setPool,
  getConnectionInfo,
  isConnected,
} from '../shared/pool';
import { validatePostgresConnectionString } from './connection.validator';
import { mapPgError, createConnectionError } from './connection.errors';
import type {
  ConnectionResult,
  TestConnectionResult,
  ConnectionStatus,
  SSLConfig,
} from './connection.types';

/**
 * Transform connection string for Docker environment.
 * When running in Docker, localhost/127.0.0.1 needs to be replaced with
 * host.docker.internal to reach databases on the host machine.
 */
function transformConnectionStringForDocker(connectionString: string): string {
  if (process.env.CLOAK_RUNNING_IN_DOCKER !== 'true') {
    return connectionString;
  }

  return connectionString
    .replace(/@localhost([:/])/, '@host.docker.internal$1')
    .replace(/@127\.0\.0\.1([:/])/, '@host.docker.internal$1');
}

/**
 * Remove sslmode parameter from connection string.
 * This is necessary because node-postgres ignores the `ssl` config option
 * when sslmode is present in the connection string URL.
 * We handle SSL entirely through the `ssl` config option for full control.
 */
function removeSSLModeFromConnectionString(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete('sslmode');
    return url.toString();
  } catch {
    return connectionString;
  }
}

/**
 * Extract sslmode from connection string.
 */
function getSSLModeFromConnectionString(
  connectionString: string,
): string | null {
  try {
    const url = new URL(connectionString);
    return url.searchParams.get('sslmode');
  } catch {
    return null;
  }
}

/**
 * Build SSL options for pg Pool based on connection string sslmode and SSL config.
 */
function buildSSLOptions(
  connectionString: string,
  sslConfig?: SSLConfig,
): false | object {
  const sslMode = getSSLModeFromConnectionString(connectionString);

  if (!sslMode || sslMode === 'disable') {
    return false;
  }

  // For 'require' mode without certificates, use minimal SSL config
  // For 'verify-ca' and 'verify-full', include certificate options
  return {
    rejectUnauthorized: sslConfig?.rejectUnauthorized ?? sslMode !== 'require',
    ca: sslConfig?.ca || undefined,
    cert: sslConfig?.cert || undefined,
    key: sslConfig?.key || undefined,
    passphrase: sslConfig?.passphrase || undefined,
  };
}

/**
 * Test a database connection without persisting it.
 * Validates the connection string and attempts a brief connection.
 *
 * @param connectionString - PostgreSQL connection string
 * @param sslConfig - Optional SSL configuration for certificates
 * @returns TestConnectionResult indicating success or failure with error details
 */
export async function testConnection(
  connectionString: string,
  sslConfig?: SSLConfig,
): Promise<TestConnectionResult> {
  // Validate connection string format and PostgreSQL enforcement
  const validation = validatePostgresConnectionString(connectionString);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  // Attempt to connect
  let testPool: Pool | null = null;
  try {
    // Remove sslmode from URL - we handle SSL via the ssl config option
    // (node-postgres ignores ssl config when sslmode is in the URL)
    const cleanedConnectionString =
      removeSSLModeFromConnectionString(connectionString);
    const transformedConnectionString = transformConnectionStringForDocker(
      cleanedConnectionString,
    );
    testPool = new Pool({
      connectionString: transformedConnectionString,
      max: 1,
      connectionTimeoutMillis: 10000, // 10 second timeout for test
      ssl: buildSSLOptions(connectionString, sslConfig),
    });

    // Try to get a client to verify connection works
    const client = await testPool.connect();
    client.release();

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: mapPgError(err, validation.parsed),
    };
  } finally {
    // Always clean up the test pool
    if (testPool) {
      await testPool.end().catch(() => {
        // Ignore cleanup errors
      });
    }
  }
}

/**
 * Connect to a database and store the connection pool.
 * Only one connection at a time is supported.
 *
 * @param connectionString - PostgreSQL connection string
 * @param sslConfig - Optional SSL configuration for certificates
 * @returns ConnectionResult with connection info or error
 */
export async function connect(
  connectionString: string,
  sslConfig?: SSLConfig,
): Promise<ConnectionResult> {
  // Check if already connected
  if (isConnected()) {
    return {
      success: false,
      error: createConnectionError(
        ErrorCodes.ALREADY_CONNECTED,
        'Already connected to a database',
        'Disconnect from the current database first',
      ),
    };
  }

  // Validate connection string
  const validation = validatePostgresConnectionString(connectionString);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  // Create the pool
  let pool: Pool | null = null;
  try {
    // Remove sslmode from URL - we handle SSL via the ssl config option
    // (node-postgres ignores ssl config when sslmode is in the URL)
    const cleanedConnectionString =
      removeSSLModeFromConnectionString(connectionString);
    const transformedConnectionString = transformConnectionStringForDocker(
      cleanedConnectionString,
    );
    pool = new Pool({
      connectionString: transformedConnectionString,
      max: 10, // Maximum connections in pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: buildSSLOptions(connectionString, sslConfig),
    });

    // Verify connection by getting a client
    const client = await pool.connect();
    client.release();

    // Store the pool and connection info
    setPool(pool, validation.parsed);

    return {
      success: true,
      host: validation.parsed.host,
      port: validation.parsed.port,
      database: validation.parsed.database,
      user: validation.parsed.user,
    };
  } catch (err) {
    // Clean up pool if it was created
    if (pool) {
      await pool.end().catch(() => {});
    }

    return {
      success: false,
      error: mapPgError(err, validation.parsed),
    };
  }
}

/**
 * Disconnect from the current database.
 *
 * @returns Object indicating success
 */
export async function disconnect(): Promise<{ success: boolean }> {
  const pool = getPool();

  if (!pool) {
    // Not connected, but that's fine - idempotent operation
    return { success: true };
  }

  try {
    await pool.end();
    setPool(null, null);
    return { success: true };
  } catch {
    // Force clear even if end() fails
    setPool(null, null);
    return { success: true };
  }
}

/**
 * Get the current connection status.
 *
 * @returns ConnectionStatus with current connection info
 */
export function getStatus(): ConnectionStatus {
  const connected = isConnected();
  const info = getConnectionInfo();

  if (!connected || !info) {
    return { connected: false };
  }

  return {
    connected: true,
    host: info.host,
    port: info.port,
    database: info.database,
    user: info.user,
  };
}
