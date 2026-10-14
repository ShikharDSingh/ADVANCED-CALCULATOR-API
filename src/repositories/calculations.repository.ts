import { randomUUID } from "node:crypto";
export interface CalculationRecord {
  id: string;
  operation: string;
  inputs: unknown;
  result: number;
  createdAt: string;
}
class CalculationsRepository {
  private readonly records = new Map<string, CalculationRecord>();
  create(operation: string, inputs: unknown, result: number): CalculationRecord {
    const record: CalculationRecord = { id: randomUUID(), operation, inputs, result, createdAt: new Date().toISOString() };
    this.records.set(record.id, record);
    return record;
  }
  findAll(page: number, limit: number) {
    const all = [...this.records.values()].reverse();
    const total = all.length;
    return { items: all.slice((page - 1) * limit, page * limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
  findById(id: string) { return this.records.get(id); }
  deleteById(id: string) { return this.records.delete(id); }
  clear() { const deletedCount = this.records.size; this.records.clear(); return deletedCount; }
  // Used by tests to isolate in-memory history between cases.
  resetForTests() { this.records.clear(); }
}
export const calculationsRepository = new CalculationsRepository();
