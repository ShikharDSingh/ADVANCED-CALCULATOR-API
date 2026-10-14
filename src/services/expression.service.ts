import { env } from "../config/env";
import { ApiError } from "../utils/api-error";
import { calculate } from "../utils/calculate";
type Token = number | "+" | "-" | "*" | "/" | "%" | "(" | ")";

class Parser {
  private position = 0;
  constructor(private readonly tokens: Token[]) {}
  parse(): number {
    const result = this.expression();
    if (this.position !== this.tokens.length) throw this.invalidExpression();
    return result;
  }
  private expression(): number {
    let value = this.term();
    while (this.peek() === "+" || this.peek() === "-") {
      const operator = this.consume();
      const right = this.term();
      value = operator === "+" ? calculate("add", value, right) : calculate("subtract", value, right);
    }
    return value;
  }
  private term(): number {
    let value = this.unary();
    while (this.peek() === "*" || this.peek() === "/" || this.peek() === "%") {
      const operator = this.consume();
      const right = this.unary();
      if (operator === "*") value = calculate("multiply", value, right);
      else if (operator === "/") value = calculate("divide", value, right);
      else value = calculate("modulo", value, right);
    }
    return value;
  }
  private unary(): number {
    if (this.peek() === "+") { this.consume(); return this.unary(); }
    if (this.peek() === "-") { this.consume(); return this.checked(-this.unary()); }
    return this.primary();
  }
  private primary(): number {
    const token = this.peek();
    if (typeof token === "number") { this.consume(); return token; }
    if (token === "(") {
      this.consume();
      const value = this.expression();
      if (this.peek() !== ")") throw this.invalidExpression();
      this.consume();
      return value;
    }
    throw this.invalidExpression();
  }
  private peek() { return this.tokens[this.position]; }
  private consume(): Token {
    const token = this.tokens[this.position];
    if (token === undefined) throw this.invalidExpression();
    this.position++;
    return token;
  }
  private checked(value: number): number {
    if (!Number.isFinite(value) || Math.abs(value) > env.MAX_ABSOLUTE_VALUE) throw ApiError.badRequest("Calculation result exceeds the supported numeric range.", "RESULT_OUT_OF_RANGE");
    return value;
  }
  private invalidExpression() { return ApiError.badRequest("Malformed mathematical expression.", "INVALID_EXPRESSION"); }
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < expression.length) {
    const char = expression[i]!;
    if (/\s/.test(char)) { i++; continue; }
    if ("+-*/%()".includes(char)) { tokens.push(char as Token); i++; continue; }
    if (/[0-9.]/.test(char)) {
      const match = expression.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
      if (!match) throw ApiError.badRequest("Malformed numeric literal.", "INVALID_EXPRESSION");
      const number = Number(match[0]);
      if (!Number.isFinite(number) || Math.abs(number) > env.MAX_ABSOLUTE_VALUE) throw ApiError.badRequest("Numeric literal is outside the supported range.", "NUMBER_OUT_OF_RANGE");
      tokens.push(number); i += match[0].length; continue;
    }
    throw ApiError.badRequest(`Unsupported character '${char}'.`, "INVALID_EXPRESSION");
  }
  if (tokens.length === 0) throw ApiError.badRequest("Expression cannot be empty.", "INVALID_EXPRESSION");
  return tokens;
}

export function evaluateExpression(expression: string): number {
  if (expression.length > env.MAX_EXPRESSION_LENGTH) throw ApiError.badRequest("Expression exceeds the maximum permitted length.", "EXPRESSION_TOO_LONG");
  return new Parser(tokenize(expression)).parse();
}
