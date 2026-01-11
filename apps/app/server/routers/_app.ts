import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

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
});

// Export type router type signature for client usage
export type AppRouter = typeof appRouter;
