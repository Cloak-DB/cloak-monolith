import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import {
  getSchemas,
  getTables,
  getColumns,
  getRelationships,
  getIndexes,
} from '@cloak-db/db-core';

export const schemaRouter = router({
  /**
   * List all schemas in the database (excluding system schemas)
   */
  getSchemas: publicProcedure.query(() => getSchemas()),

  /**
   * List all tables in a schema with row counts
   */
  getTables: publicProcedure
    .input(z.object({ schema: z.string().min(1) }))
    .query(({ input }) => getTables(input.schema)),

  /**
   * Get columns for a specific table with primary key and foreign key info
   */
  getColumns: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
      }),
    )
    .query(({ input }) => getColumns(input.schema, input.table)),

  /**
   * Get foreign key relationships for a table
   */
  getRelationships: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
      }),
    )
    .query(({ input }) => getRelationships(input.schema, input.table)),

  /**
   * Get indexes for a table
   */
  getIndexes: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
      }),
    )
    .query(({ input }) => getIndexes(input.schema, input.table)),
});

export type SchemaRouter = typeof schemaRouter;
