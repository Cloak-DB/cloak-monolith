import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  chmodSync,
  existsSync,
} from 'node:fs';
import { ConfigSchema } from './config.schema';
import type { Config, AppPreferences } from './config.types';

/**
 * Get the config directory path
 * macOS/Linux: ~/.config/cloak-db/
 */
export function getConfigDir(): string {
  return join(homedir(), '.config', 'cloak-db');
}

/**
 * Get the full config file path
 */
export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

/**
 * Get default config for first-run
 */
export function getDefaultConfig(): Config {
  return {
    version: 1,
    connections: [],
    preferences: {
      theme: 'system',
      defaultSchema: 'public',
      defaultPageSize: 25,
    },
  };
}

/**
 * Ensure the config directory exists with proper permissions
 */
export function ensureConfigDir(): void {
  const configDir = getConfigDir();
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true, mode: 0o700 });
  }
}

/**
 * Read and validate the config file
 * Returns default config if file doesn't exist
 */
export function readConfig(): Config {
  const configPath = getConfigPath();

  if (!existsSync(configPath)) {
    return getDefaultConfig();
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(content);
    const validated = ConfigSchema.parse(parsed);
    return validated;
  } catch {
    // If config is corrupted or invalid, return default
    // In the future we might want to backup the corrupted file
    return getDefaultConfig();
  }
}

/**
 * Write config to disk with secure permissions
 */
export function writeConfig(config: Config): void {
  ensureConfigDir();
  const configPath = getConfigPath();
  const content = JSON.stringify(config, null, 2);
  writeFileSync(configPath, content, { mode: 0o600 });
}

/**
 * Add or update a saved connection
 */
export function saveConnection(
  name: string,
  connectionString: string,
  options: { id?: string; default?: boolean } = {},
): Config {
  const config = readConfig();
  const now = new Date().toISOString();

  if (options.id) {
    // Update existing connection
    const index = config.connections.findIndex((c) => c.id === options.id);
    if (index !== -1) {
      config.connections[index] = {
        ...config.connections[index],
        name,
        connectionString,
        default: options.default ?? config.connections[index].default,
      };
    }
  } else {
    // Add new connection
    const id = crypto.randomUUID();
    const isDefault = options.default ?? config.connections.length === 0;

    // If this is the new default, unset other defaults
    if (isDefault) {
      config.connections = config.connections.map((c) => ({
        ...c,
        default: false,
      }));
    }

    config.connections.push({
      id,
      name,
      connectionString,
      default: isDefault,
      createdAt: now,
    });
  }

  writeConfig(config);
  return config;
}

/**
 * Delete a saved connection
 */
export function deleteConnection(id: string): Config {
  const config = readConfig();
  config.connections = config.connections.filter((c) => c.id !== id);
  writeConfig(config);
  return config;
}

/**
 * Set a connection as the default
 */
export function setDefaultConnection(id: string): Config {
  const config = readConfig();
  config.connections = config.connections.map((c) => ({
    ...c,
    default: c.id === id,
  }));
  writeConfig(config);
  return config;
}

/**
 * Update app preferences
 */
export function updatePreferences(
  preferences: Partial<AppPreferences>,
): Config {
  const config = readConfig();
  config.preferences = {
    ...config.preferences,
    ...preferences,
  };
  writeConfig(config);
  return config;
}
