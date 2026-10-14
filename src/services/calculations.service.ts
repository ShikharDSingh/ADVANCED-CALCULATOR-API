import { calculationsRepository } from "../repositories/calculations.repository";
import { ApiError } from "../utils/api-error";
export function getHistory(page: number, limit: number) { return calculationsRepository.findAll(page, limit); }
export function getHistoryById(id: string) {
  const record = calculationsRepository.findById(id);
  if (!record) throw ApiError.notFound("Calculation history record not found.", "CALCULATION_NOT_FOUND");
  return record;
}
export function deleteHistoryById(id: string) {
  if (!calculationsRepository.deleteById(id)) throw ApiError.notFound("Calculation history record not found.", "CALCULATION_NOT_FOUND");
}
export function clearHistory() { return { deletedCount: calculationsRepository.clear() }; }
