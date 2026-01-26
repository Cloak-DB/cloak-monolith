/**
 * Configuration types for Cloak DB
 */

export interface SavedConnection {
  id: string;
  name: string;
  connectionString: string;
  default: boolean;
  createdAt: string;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
    passphrase?: string;
  };
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultSchema: string;
  defaultPageSize: number;
}

export interface Config {
  version: 1;
  connections: SavedConnection[];
  preferences: AppPreferences;
}
