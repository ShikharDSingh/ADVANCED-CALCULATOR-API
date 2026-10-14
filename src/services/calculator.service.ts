import { ApiError } from "../utils/api-error";
import { calculate, type OperationName } from "../utils/calculate";
import { calculationsRepository } from "../repositories/calculations.repository";
import type { ChainInput } from "../validators/calculator.validator";

export function performCalculation(operation: OperationName, a: number, b: number) {
  const result = calculate(operation, a, b);
  const history = calculationsRepository.create(operation, { a, b }, result);
  return { operation, inputs: { a, b }, result, calculationId: history.id, createdAt: history.createdAt };
}
export function performChain(input: ChainInput) {
  let current = input.initialValue;
  const steps: Array<{ operation: OperationName; input: number; operand: number; result: number }> = [];
  for (const [index, operation] of input.operations.entries()) {
    const previous = current;
    try {
      current = calculate(operation.operator, current, operation.value);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new ApiError(error.statusCode, error.code, `Chain failed at step ${index + 1}: ${error.message}`, { failedStep: index + 1, operation: operation.operator, input: previous, operand: operation.value });
      }
      throw error;
    }
    steps.push({ operation: operation.operator, input: previous, operand: operation.value, result: current });
  }
  const history = calculationsRepository.create("chain", input, current);
  return { initialValue: input.initialValue, result: current, steps, calculationId: history.id, createdAt: history.createdAt };
}
