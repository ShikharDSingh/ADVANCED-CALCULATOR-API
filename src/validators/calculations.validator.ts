import { z } from "zod";
const positiveInteger = z.string().regex(/^[1-9]\d*$/, "Must be a positive integer.").transform(Number).pipe(z.number().int().positive().max(10000));
export const paginationSchema = z.object({ page: positiveInteger.optional().default(1), limit: positiveInteger.optional().default(10) }).strict();
export const calculationIdSchema = z.object({ id: z.string().uuid("Invalid calculation ID.") }).strict();
