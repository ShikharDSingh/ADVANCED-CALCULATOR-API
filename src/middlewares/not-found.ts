import type { RequestHandler } from "express";
import { ApiError } from "../utils/api-error";
export const notFound: RequestHandler = (req, _res, next) => next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} was not found.`, "ROUTE_NOT_FOUND"));
