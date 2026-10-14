import rateLimit from "express-rate-limit";
import { env } from "../config/env";
export const calculationRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many calculation requests. Please try again later.", details: null }, requestId: res.locals.requestId })
});
