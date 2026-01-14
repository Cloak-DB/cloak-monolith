import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { connectionRouter } from './connection';
import { configRouter } from './config';
import { schemaRouter } from './schema';
import { tableRouter } from './table';
import { queryRouter } from './query';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }),

  hello: publicProcedure.input(z.string().optional()).query(({ input }) => {
    return {
      greeting: `Hello ${input ?? 'World'}!`,
    };
  }),

  connection: connectionRouter,
  config: configRouter,
  schema: schemaRouter,
  table: tableRouter,
  query: queryRouter,
});

// Export type router type signature for client usage
export type AppRouter = typeof appRouter;
