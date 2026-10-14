export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details: unknown;
  readonly isOperational = true;

  constructor(statusCode: number, code: string, message: string, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message: string, code = "BAD_REQUEST", details: unknown = null) {
    return new ApiError(400, code, message, details);
  }
  static notFound(message = "Resource not found.", code = "RESOURCE_NOT_FOUND") {
    return new ApiError(404, code, message);
  }
  static tooManyRequests(message = "Too many requests. Please try again later.") {
    return new ApiError(429, "RATE_LIMIT_EXCEEDED", message);
  }
  static internal() {
    return new ApiError(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.");
  }
}
