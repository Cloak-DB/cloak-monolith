import 'server-only';
import { appRouter } from '@/server/routers/_app';

/**
 * Create a server-side caller for tRPC procedures
 * Use this in Server Components and Route Handlers
 */
export const createCaller = () => {
  return appRouter.createCaller({});
};
