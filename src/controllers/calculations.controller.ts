import type { RequestHandler } from "express";
import { ApiResponse } from "../utils/api-response";
import { clearHistory, deleteHistoryById, getHistory, getHistoryById } from "../services/calculations.service";

export const listCalculations: RequestHandler = (_req, res) => {
  const { page, limit } = res.locals.validatedQuery as { page: number; limit: number };
  return ApiResponse.send(res, 200, "Calculation history retrieved successfully.", getHistory(page, limit));
};
export const getCalculation: RequestHandler = (_req, res) => {
  const { id } = res.locals.validatedParams as { id: string };
  return ApiResponse.send(res, 200, "Calculation retrieved successfully.", getHistoryById(id));
};
export const deleteCalculation: RequestHandler = (_req, res) => {
  const { id } = res.locals.validatedParams as { id: string };
  deleteHistoryById(id);
  return ApiResponse.send(res, 200, "Calculation deleted successfully.", { id });
};
export const deleteAllCalculations: RequestHandler = (_req, res) => ApiResponse.send(res, 200, "Calculation history cleared successfully.", clearHistory());
