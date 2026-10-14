import type { RequestHandler } from "express";
import { ApiResponse } from "../utils/api-response";
import { performCalculation, performChain } from "../services/calculator.service";
import { evaluateExpression } from "../services/expression.service";
import { calculationsRepository } from "../repositories/calculations.repository";
import type { ChainInput, EvaluateInput } from "../validators/calculator.validator";
import type { OperationName } from "../utils/calculate";

export function arithmeticController(operation: OperationName): RequestHandler {
  return (req, res) => {
    const { a, b } = res.locals.validatedBody as { a: number; b: number };
    return ApiResponse.send(res, 200, "Calculation completed successfully.", performCalculation(operation, a, b));
  };
}
export const evaluateController: RequestHandler = (req, res) => {
  const { expression } = res.locals.validatedBody as EvaluateInput;
  const result = evaluateExpression(expression);
  const history = calculationsRepository.create("evaluate", { expression }, result);
  return ApiResponse.send(res, 200, "Expression evaluated successfully.", { expression, result, calculationId: history.id, createdAt: history.createdAt });
};
export const chainController: RequestHandler = (req, res) => {
  const data = performChain(res.locals.validatedBody as ChainInput);
  return ApiResponse.send(res, 200, "Chained calculation completed successfully.", data);
};
