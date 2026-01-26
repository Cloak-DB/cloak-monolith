import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import {
  readConfig,
  saveConnection,
  deleteConnection,
  setDefaultConnection,
} from '@cloak-db/db-core';

const sslConfigSchema = z
  .object({
    rejectUnauthorized: z.boolean().optional(),
    ca: z.string().optional(),
    cert: z.string().optional(),
    key: z.string().optional(),
    passphrase: z.string().optional(),
  })
  .optional();

export const configRouter = router({
  /**
   * Get the full config
   */
  get: publicProcedure.query(() => readConfig()),

  /**
   * Save a new connection or update an existing one
   */
  saveConnection: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        connectionString: z.string().min(1),
        default: z.boolean().optional(),
        ssl: sslConfigSchema,
      }),
    )
    .mutation(({ input }) => {
      const config = saveConnection(input.name, input.connectionString, {
        id: input.id,
        default: input.default,
        ssl: input.ssl,
      });
      const connection = config.connections.find(
        (c) =>
          c.name === input.name &&
          c.connectionString === input.connectionString,
      );
      return { success: true as const, connection };
    }),

  /**
   * Delete a saved connection
   */
  deleteConnection: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      deleteConnection(input.id);
      return { success: true as const };
    }),

  /**
   * Set a connection as the default
   */
  setDefaultConnection: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      setDefaultConnection(input.id);
      return { success: true as const };
    }),
});

export type ConfigRouter = typeof configRouter;
