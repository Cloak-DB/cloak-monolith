import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import {
  testConnection,
  connect,
  disconnect,
  getStatus,
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

export const connectionRouter = router({
  /**
   * Test a connection string without persisting
   */
  test: publicProcedure
    .input(
      z.object({
        connectionString: z.string().min(1),
        ssl: sslConfigSchema,
      }),
    )
    .mutation(({ input }) => testConnection(input.connectionString, input.ssl)),

  /**
   * Connect to a database and store the connection
   */
  connect: publicProcedure
    .input(
      z.object({
        connectionString: z.string().min(1),
        name: z.string().optional(),
        ssl: sslConfigSchema,
      }),
    )
    .mutation(({ input }) => connect(input.connectionString, input.ssl)),

  /**
   * Disconnect from the current database
   */
  disconnect: publicProcedure.mutation(() => disconnect()),

  /**
   * Get current connection status
   */
  status: publicProcedure.query(() => getStatus()),
});

export type ConnectionRouter = typeof connectionRouter;
