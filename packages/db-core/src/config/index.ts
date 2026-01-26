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
} from './config.service';

// Config types
export type { Config, SavedConnection, AppPreferences } from './config.types';

// Config schemas (for validation)
export {
  ConfigSchema,
  SavedConnectionSchema,
  AppPreferencesSchema,
  SSLConfigSchema,
} from './config.schema';
