import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import {
  getRows,
  getAllRows,
  getRow,
  createRow,
  updateRow,
  deleteRow,
  saveBatch,
} from '@cloak-db/db-core';

const FilterOperatorSchema = z.enum([
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'is_null',
  'is_not_null',
]);

const FilterSchema = z.object({
  column: z.string().min(1),
  operator: FilterOperatorSchema,
  value: z.unknown().optional(),
});

const OrderBySchema = z.object({
  column: z.string().min(1),
  direction: z.enum(['asc', 'desc']),
});

const PrimaryKeySchema = z
  .record(z.string(), z.unknown())
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Primary key cannot be empty',
  });

const RowDataSchema = z.record(z.string(), z.unknown());

export const tableRouter = router({
  /**
   * Get rows from a table with pagination, sorting, and filtering
   */
  getRows: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
        limit: z.number().min(1).max(1000).optional(),
        offset: z.number().min(0).optional(),
        orderBy: OrderBySchema.optional(),
        filters: z.array(FilterSchema).optional(),
      }),
    )
    .query(({ input }) =>
      getRows(input.schema, input.table, {
        limit: input.limit,
        offset: input.offset,
        orderBy: input.orderBy,
        filters: input.filters,
      }),
    ),

  /**
   * Get all rows from a table (up to a limit) for full-table search
   */
  getAllRows: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
        limit: z.number().min(1).max(10000).optional(),
        orderBy: OrderBySchema.optional(),
        filters: z.array(FilterSchema).optional(),
      }),
    )
    .query(({ input }) =>
      getAllRows(input.schema, input.table, {
        limit: input.limit,
        orderBy: input.orderBy,
        filters: input.filters,
      }),
    ),

  /**
   * Get a single row by primary key
   */
  getRow: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
        primaryKey: PrimaryKeySchema,
      }),
    )
    .query(({ input }) => getRow(input.schema, input.table, input.primaryKey)),

  /**
   * Create a new row in a table
   */
  createRow: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
        data: RowDataSchema,
      }),
    )
    .mutation(({ input }) => createRow(input.schema, input.table, input.data)),

  /**
   * Update an existing row by primary key
   */
  updateRow: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
        primaryKey: PrimaryKeySchema,
        data: RowDataSchema,
      }),
    )
    .mutation(({ input }) =>
      updateRow(input.schema, input.table, input.primaryKey, input.data),
    ),

  /**
   * Delete a row by primary key
   */
  deleteRow: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
        primaryKey: PrimaryKeySchema,
      }),
    )
    .mutation(({ input }) =>
      deleteRow(input.schema, input.table, input.primaryKey),
    ),

  /**
   * Save multiple rows atomically in a transaction
   * All operations succeed or all fail - no partial saves.
   */
  saveBatch: publicProcedure
    .input(
      z.object({
        schema: z.string().min(1),
        table: z.string().min(1),
        creates: z.array(RowDataSchema),
        updates: z.array(
          z.object({
            primaryKey: PrimaryKeySchema,
            data: RowDataSchema,
          }),
        ),
      }),
    )
    .mutation(({ input }) =>
      saveBatch(input.schema, input.table, input.creates, input.updates),
    ),
});

export type TableRouter = typeof tableRouter;
