import { z } from 'zod';

export const SSLConfigSchema = z.object({
  rejectUnauthorized: z.boolean().optional(),
  ca: z.string().optional(),
  cert: z.string().optional(),
  key: z.string().optional(),
  passphrase: z.string().optional(),
});

export const SavedConnectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  connectionString: z.string().min(1),
  default: z.boolean(),
  createdAt: z.string().datetime(),
  ssl: SSLConfigSchema.optional(),
});

export const AppPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  defaultSchema: z.string(),
  defaultPageSize: z.number().int().positive(),
});

export const ConfigSchema = z.object({
  version: z.literal(1),
  connections: z.array(SavedConnectionSchema),
  preferences: AppPreferencesSchema,
});

export type ConfigFromSchema = z.infer<typeof ConfigSchema>;
