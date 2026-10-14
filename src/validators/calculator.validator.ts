import { z } from "zod";
import { env } from "../config/env";
const finiteNumber = z.number().finite().min(-env.MAX_ABSOLUTE_VALUE).max(env.MAX_ABSOLUTE_VALUE);
export const binaryOperationSchema = z.object({ a: finiteNumber, b: finiteNumber }).strict();
export const chainSchema = z.object({
  initialValue: finiteNumber,
  operations: z.array(z.object({ operator: z.enum(["add", "subtract", "multiply", "divide", "power", "modulo"]), value: finiteNumber }).strict()).min(1, "At least one operation is required.").max(env.MAX_CHAIN_OPERATIONS, "Too many chained operations.")
}).strict();
export const evaluateSchema = z.object({ expression: z.string().trim().min(1, "Expression is required.").max(env.MAX_EXPRESSION_LENGTH, "Expression is too long.") }).strict();
export type ChainInput = z.infer<typeof chainSchema>;
export type EvaluateInput = z.infer<typeof evaluateSchema>;
