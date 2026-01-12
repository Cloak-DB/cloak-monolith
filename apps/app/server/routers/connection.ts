import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import {
  testConnection,
  connect,
  disconnect,
  getStatus,
} from '@cloak-db/db-core';

export const connectionRouter = router({
  /**
   * Test a connection string without persisting
   */
  test: publicProcedure
    .input(z.object({ connectionString: z.string().min(1) }))
    .mutation(({ input }) => testConnection(input.connectionString)),

  /**
   * Connect to a database and store the connection
   */
  connect: publicProcedure
    .input(
      z.object({
        connectionString: z.string().min(1),
        name: z.string().optional(),
      }),
    )
    .mutation(({ input }) => connect(input.connectionString)),

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
