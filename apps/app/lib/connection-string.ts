export type SSLMode = 'disable' | 'require' | 'verify-ca' | 'verify-full';

export interface ParsedSSLConfig {
  enabled: boolean;
  mode: SSLMode | null;
}

export const SSL_MODE_OPTIONS = [
  {
    value: 'disable',
    label: 'Disable',
    description: 'No SSL connection',
  },
  {
    value: 'require',
    label: 'Require',
    description: 'SSL, no certificate verification',
  },
  {
    value: 'verify-ca',
    label: 'Verify CA',
    description: 'SSL + verify CA signature',
  },
  {
    value: 'verify-full',
    label: 'Verify Full',
    description: 'SSL + verify CA + hostname',
  },
] as const;

const VALID_SSL_MODES: SSLMode[] = [
  'disable',
  'require',
  'verify-ca',
  'verify-full',
];

/**
 * Type guard to check if a string is a valid SSL mode
 */
export function isValidSSLMode(mode: string): mode is SSLMode {
  return VALID_SSL_MODES.includes(mode as SSLMode);
}

/**
 * Parse SSL mode from a PostgreSQL connection string
 * Returns the SSL configuration based on the sslmode query parameter
 */
export function parseSSLMode(connectionString: string): ParsedSSLConfig {
  if (!connectionString.trim()) {
    return { enabled: false, mode: null };
  }

  try {
    // Handle connection strings that might not have a protocol
    let urlString = connectionString;
    if (
      !urlString.startsWith('postgres://') &&
      !urlString.startsWith('postgresql://')
    ) {
      // If it doesn't look like a URL, return default
      return { enabled: false, mode: null };
    }

    const url = new URL(urlString);
    const sslmode = url.searchParams.get('sslmode');

    if (!sslmode) {
      return { enabled: false, mode: null };
    }

    if (isValidSSLMode(sslmode)) {
      // 'disable' mode means SSL is explicitly disabled
      if (sslmode === 'disable') {
        return { enabled: true, mode: 'disable' };
      }
      return { enabled: true, mode: sslmode };
    }

    // Invalid sslmode value, treat as not set
    return { enabled: false, mode: null };
  } catch {
    // Invalid URL, return default
    return { enabled: false, mode: null };
  }
}

/**
 * Update or add SSL mode in a PostgreSQL connection string
 * If mode is null, removes the sslmode parameter
 */
export function updateSSLMode(
  connectionString: string,
  mode: SSLMode | null,
): string {
  if (!connectionString.trim()) {
    return connectionString;
  }

  try {
    // Handle connection strings that might not have a protocol
    if (
      !connectionString.startsWith('postgres://') &&
      !connectionString.startsWith('postgresql://')
    ) {
      return connectionString;
    }

    const url = new URL(connectionString);

    if (mode === null) {
      // Remove sslmode parameter
      url.searchParams.delete('sslmode');
    } else {
      // Add or update sslmode parameter
      url.searchParams.set('sslmode', mode);
    }

    return url.toString();
  } catch {
    // Invalid URL, return unchanged
    return connectionString;
  }
}
