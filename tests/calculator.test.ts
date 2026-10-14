import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { calculationsRepository } from "../src/repositories/calculations.repository";

describe("Advanced Calculator API", () => {
  beforeEach(() => calculationsRepository.resetForTests());

  it("returns a request ID header and centralized success envelope", async () => {
    const response = await request(app).post("/api/v1/calculator/add").send({ a: 10, b: 3 });
    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBeTruthy();
    expect(response.body).toMatchObject({ success: true, data: { operation: "add", result: 13 } });
    expect(response.body.requestId).toBe(response.headers["x-request-id"]);
  });

  it.each([
    ["subtract", { a: 10, b: 3 }, 7], ["multiply", { a: 2.5, b: -2 }, -5],
    ["divide", { a: 9, b: 2 }, 4.5], ["power", { a: 2, b: 3 }, 8], ["modulo", { a: 10, b: 3 }, 1]
  ])("supports %s", async (operation, body, result) => {
    const response = await request(app).post(`/api/v1/calculator/${operation}`).send(body);
    expect(response.status).toBe(200);
    expect(response.body.data.result).toBe(result);
  });

  it("rejects strings and unexpected fields without coercion", async () => {
    const response = await request(app).post("/api/v1/calculator/add").send({ a: "2", b: 3, extra: true });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.requestId).toBe(response.headers["x-request-id"]);
  });

  it.each([["divide", "DIVISION_BY_ZERO"], ["modulo", "MODULO_BY_ZERO"]])("handles zero in %s", async (operation, code) => {
    const response = await request(app).post(`/api/v1/calculator/${operation}`).send({ a: 5, b: 0 });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe(code);
  });

  it("evaluates precedence, parentheses, decimals and negative numbers safely", async () => {
    const response = await request(app).post("/api/v1/calculator/evaluate").send({ expression: "(10 + 5) * 2 - 8 / 4" });
    expect(response.status).toBe(200);
    expect(response.body.data.result).toBe(28);
    const negative = await request(app).post("/api/v1/calculator/evaluate").send({ expression: "-5 + 2.5" });
    expect(negative.body.data.result).toBe(-2.5);
  });

  it("rejects malformed expressions and arbitrary code", async () => {
    for (const expression of ["2 + * 3", "process.exit()", "(2 + 3"]) {
      const response = await request(app).post("/api/v1/calculator/evaluate").send({ expression });
      expect(response.status).toBe(400);
    }
  });

  it("executes chain sequentially and records history", async () => {
    const response = await request(app).post("/api/v1/calculator/chain").send({ initialValue: 100, operations: [{ operator: "subtract", value: 20 }, { operator: "multiply", value: 2 }, { operator: "divide", value: 4 }] });
    expect(response.status).toBe(200);
    expect(response.body.data.result).toBe(40);
    expect(response.body.data.steps).toHaveLength(3);
    const history = await request(app).get("/api/v1/calculations");
    expect(history.body.data.pagination.total).toBe(1);
  });

  it("validates entire chain before execution and identifies runtime failed step", async () => {
    const invalid = await request(app).post("/api/v1/calculator/chain").send({ initialValue: 10, operations: [{ operator: "add", value: 1 }, { operator: "hack", value: 3 }] });
    expect(invalid.status).toBe(400);
    expect((await request(app).get("/api/v1/calculations")).body.data.pagination.total).toBe(0);
    const failed = await request(app).post("/api/v1/calculator/chain").send({ initialValue: 10, operations: [{ operator: "add", value: 1 }, { operator: "divide", value: 0 }, { operator: "multiply", value: 2 }] });
    expect(failed.status).toBe(400);
    expect(failed.body.error.details.failedStep).toBe(2);
    expect((await request(app).get("/api/v1/calculations")).body.data.pagination.total).toBe(0);
  });

  it("supports history retrieval, pagination and deletion", async () => {
    const created = await request(app).post("/api/v1/calculator/add").send({ a: 4, b: 6 });
    const id = created.body.data.calculationId;
    expect((await request(app).get(`/api/v1/calculations/${id}`)).body.data.result).toBe(10);
    expect((await request(app).get("/api/v1/calculations?page=1&limit=1")).body.data.pagination.total).toBe(1);
    expect((await request(app).delete(`/api/v1/calculations/${id}`)).status).toBe(200);
    expect((await request(app).get(`/api/v1/calculations/${id}`)).status).toBe(404);
  });

  it("clears history and returns 404 for unknown routes", async () => {
    await request(app).post("/api/v1/calculator/add").send({ a: 1, b: 2 });
    const clear = await request(app).delete("/api/v1/calculations");
    expect(clear.body.data.deletedCount).toBe(1);
    expect((await request(app).get("/no-such-route")).status).toBe(404);
  });

  it("returns health status", async () => {
    expect((await request(app).get("/health")).body.data.status).toBe("ok");
  });
});
