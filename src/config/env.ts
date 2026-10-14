import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();
const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),
  MAX_EXPRESSION_LENGTH: z.coerce.number().int().positive().default(200),
  MAX_CHAIN_OPERATIONS: z.coerce.number().int().positive().default(50),
  MAX_ABSOLUTE_VALUE: z.coerce.number().positive().default(1e12),
  MAX_EXPONENT: z.coerce.number().positive().default(100),
  MAX_BODY_SIZE: z.string().default("16kb")
});
const result = schema.safeParse(process.env);
if (!result.success) {
  console.error("Invalid environment configuration:", result.error.flatten());
  process.exit(1);
}
export const env = Object.freeze(result.data);
