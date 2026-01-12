import { z } from 'zod';

export const SavedConnectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  connectionString: z.string().min(1),
  default: z.boolean(),
  createdAt: z.string().datetime(),
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
