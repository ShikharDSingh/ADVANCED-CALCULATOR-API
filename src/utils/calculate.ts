import { env } from "../config/env";
import { ApiError } from "./api-error";

export type OperationName = "add" | "subtract" | "multiply" | "divide" | "power" | "modulo";
type Operation = (a: number, b: number) => number;

export const operationRegistry: Record<OperationName, Operation> = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw ApiError.badRequest("Division by zero is not allowed.", "DIVISION_BY_ZERO");
    return a / b;
  },
  power: (a, b) => {
    if (Math.abs(b) > env.MAX_EXPONENT) throw ApiError.badRequest(`Exponent must be between -${env.MAX_EXPONENT} and ${env.MAX_EXPONENT}.`, "EXPONENT_OUT_OF_RANGE");
    if (a === 0 && b < 0) throw ApiError.badRequest("Zero cannot be raised to a negative exponent.", "DIVISION_BY_ZERO");
    return Math.pow(a, b);
  },
  modulo: (a, b) => {
    if (b === 0) throw ApiError.badRequest("Modulo by zero is not allowed.", "MODULO_BY_ZERO");
    return a % b;
  }
};

export function calculate(operation: OperationName, a: number, b: number): number {
  const result = operationRegistry[operation](a, b);
  if (!Number.isFinite(result) || Math.abs(result) > env.MAX_ABSOLUTE_VALUE) {
    throw ApiError.badRequest("Calculation result exceeds the supported numeric range.", "RESULT_OUT_OF_RANGE");
  }
  return result;
}
