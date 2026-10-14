import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/api-error";

export function validateBody(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return next(ApiError.badRequest("Request body validation failed.", "VALIDATION_ERROR", parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))));
    res.locals.validatedBody = parsed.data;
    next();
  };
}
export function validateQuery(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) return next(ApiError.badRequest("Query parameter validation failed.", "VALIDATION_ERROR", parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))));
    res.locals.validatedQuery = parsed.data;
    next();
  };
}
export function validateParams(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) return next(ApiError.badRequest("Route parameter validation failed.", "VALIDATION_ERROR", parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }))));
    res.locals.validatedParams = parsed.data;
    next();
  };
}
