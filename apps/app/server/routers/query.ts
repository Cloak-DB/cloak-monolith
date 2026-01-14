import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { executeQuery } from '@cloak-db/db-core';

export const queryRouter = router({
  /**
   * Execute a raw SQL query
   */
  execute: publicProcedure
    .input(
      z.object({
        sql: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await executeQuery(input.sql);
      return result;
    }),
});

export type QueryRouter = typeof queryRouter;
