import type { ErrorRequestHandler } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (res.headersSent) return;
  let apiError: ApiError;
  if (error instanceof ApiError) apiError = error;
  else if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.parse.failed") apiError = ApiError.badRequest("Request body contains malformed JSON.", "INVALID_JSON");
  else if (typeof error === "object" && error !== null && "type" in error && error.type === "entity.too.large") apiError = new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body exceeds the permitted size.");
  else apiError = ApiError.internal();

  if (apiError.statusCode >= 500) {
    console.error(JSON.stringify({ requestId: res.locals.requestId, message: error instanceof Error ? error.message : "Unknown error", ...(env.NODE_ENV !== "production" && error instanceof Error ? { stack: error.stack } : {}) }));
  }
  res.status(apiError.statusCode).json({ success: false, error: { code: apiError.code, message: apiError.message, details: apiError.details }, requestId: res.locals.requestId });
};
