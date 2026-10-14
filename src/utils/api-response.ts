import type { Response } from "express";

export class ApiResponse<T> {
  readonly success = true;
  constructor(readonly message: string, readonly data: T, readonly requestId: string) {}

  static send<T>(res: Response, statusCode: number, message: string, data: T) {
    return res.status(statusCode).json(new ApiResponse(message, data, res.locals.requestId as string));
  }
}
