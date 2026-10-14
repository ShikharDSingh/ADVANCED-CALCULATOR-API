# Advanced Calculator REST API (TypeScript)

A layered Express 5 + TypeScript calculator API with safe expression parsing, sequential chained calculations, centralized responses/errors, request IDs, rate limiting, and in-memory calculation history.

## Requirements
- Node.js 20 or newer
- npm

## Setup
```bash
npm install
cp .env.example .env
npm run dev
```
Windows PowerShell: `Copy-Item .env.example .env`

The API starts on `http://localhost:3000` by default. Build with `npm run build`, run production output with `npm start`, and run tests with `npm test`.

## Configuration
`PORT`, `NODE_ENV`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`, `MAX_EXPRESSION_LENGTH`, `MAX_CHAIN_OPERATIONS`, `MAX_ABSOLUTE_VALUE`, `MAX_EXPONENT`, and `MAX_BODY_SIZE` are read and validated at startup. `.env` is ignored by Git.

## Response contracts
Every success response is:
```json
{"success":true,"message":"Human-readable message","data":{},"requestId":"uuid"}
```
Every error response is:
```json
{"success":false,"error":{"code":"DIVISION_BY_ZERO","message":"Division by zero is not allowed.","details":null},"requestId":"uuid"}
```
The same request ID is also returned as the `X-Request-ID` response header. `details` is `null` when not applicable and may contain validation issues or the failed chain step. Unexpected errors are masked as `INTERNAL_SERVER_ERROR`.

## Endpoints
All calculator endpoints are under `/api/v1/calculator` and rate limited per client IP.

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `/api/v1/calculator/add` | `{"a":10,"b":3}` | Addition |
| POST | `/api/v1/calculator/subtract` | `{"a":10,"b":3}` | Subtraction |
| POST | `/api/v1/calculator/multiply` | `{"a":10,"b":3}` | Multiplication |
| POST | `/api/v1/calculator/divide` | `{"a":10,"b":3}` | Division |
| POST | `/api/v1/calculator/power` | `{"a":2,"b":3}` | Exponentiation |
| POST | `/api/v1/calculator/modulo` | `{"a":10,"b":3}` | Modulo |
| POST | `/api/v1/calculator/evaluate` | `{"expression":"(10 + 5) * 2 - 8 / 4"}` | Safe expression evaluation |
| POST | `/api/v1/calculator/chain` | See below | Sequential operations |
| GET | `/api/v1/calculations?page=1&limit=10` | — | Paginated history |
| GET | `/api/v1/calculations/:id` | — | Get history record |
| DELETE | `/api/v1/calculations/:id` | — | Delete record |
| DELETE | `/api/v1/calculations` | — | Clear history |
| GET | `/health` | — | Health check |

### Chained calculation request
```json
{
  "initialValue": 100,
  "operations": [
    {"operator":"subtract","value":20},
    {"operator":"multiply","value":2},
    {"operator":"divide","value":4}
  ]
}
```
The operations are validated as a whole before execution, then applied in array order. A runtime failure halts the chain and responds with `details.failedStep` (1-based), `operation`, `input`, and `operand`. Failed calculations are not stored in successful history.

### Expression syntax
Supported operators: `+`, `-`, `*`, `/`, `%`, parentheses, decimal numbers, scientific notation, and unary `+`/`-`. Standard precedence applies. Exponentiation is available via the `/power` endpoint and chain `power` operation, not in expressions. Expressions are parsed with a tokenizer and recursive-descent parser; JavaScript `eval` is never used.

### Error status codes
- `400`: invalid JSON, validation error, malformed expression, division/modulo by zero, or numeric limit exceeded.
- `404`: unknown route or missing history record.
- `413`: request body exceeds `MAX_BODY_SIZE`.
- `429`: rate limit exceeded.
- `500`: unexpected server error; implementation details are hidden from the client.

## Architecture and request lifecycle
1. `request-id` assigns a UUID and sets `X-Request-ID`.
2. `request-logger` logs method, URL, status and duration (never request bodies).
3. JSON parsing rejects malformed JSON and oversized bodies.
4. Routes apply rate limiting and reusable Zod validation.
5. Controllers translate HTTP requests into service calls and use `ApiResponse` for success envelopes.
6. Services contain calculation and history use-case logic; `calculate.ts` provides an operation registry.
7. `CalculationsRepository` exclusively owns in-memory history.
8. `not-found` handles unmatched routes; `error-handler` maps all errors to the shared error contract.

Express 5 forwards rejected async handlers to error middleware; `asyncHandler` is available for explicit wrapping if needed. In-memory history is lost when the process restarts and is not shared between server instances.

## Postman
Import `postman_collection.json` into Postman. The collection includes representative arithmetic, expression, chain, history, and health requests.

## Acceptance checklist
- [x] Six basic arithmetic operations use a shared operation registry.
- [x] Reject missing operands, strings, non-finite numbers, unexpected fields and unsupported chain operators.
- [x] Division and modulo by zero return structured errors.
- [x] Safe expression parser supports precedence, parentheses, decimals and negatives without `eval`.
- [x] Chain request is fully validated before execution; execution is sequential and stops at the first failed step.
- [x] Failed chain response identifies the 1-based step and does not create a success-history record.
- [x] Successful calculations are automatically recorded in memory with UUID, operation/expression, inputs, result and timestamp.
- [x] History list supports validated `page` and `limit` with total metadata.
- [x] Get/delete by ID, clear all history, and unknown-ID 404 are implemented.
- [x] Every request receives a UUID in `X-Request-ID`; request ID is present in success/error payloads and logs.
- [x] Request logs include method, URL, status and duration, without request bodies.
- [x] Configurable per-IP calculation rate limit returns 429.
- [x] Centralized `ApiResponse`, `ApiError`, and error middleware enforce response consistency.
- [x] Malformed JSON, oversized payload, validation errors, unknown routes and unexpected exceptions are handled.
- [x] Environment variables are parsed and validated at startup; `.env.example` is included and `.env` ignored.
- [x] Automated Supertest/Vitest integration tests cover major request flows.
- [x] Health endpoint, README and Postman collection are included.
- [ ] Run `npm install`, `npm run build`, and `npm test` in the target environment before submission.

## Notes
This is a teaching assignment with an in-memory repository and a process-local rate limiter. For production multi-instance deployment, use a shared persistent database and a shared rate-limit store.
