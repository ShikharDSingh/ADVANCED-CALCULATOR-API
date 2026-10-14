import type { RequestHandler } from "express";
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(JSON.stringify({ requestId: res.locals.requestId, method: req.method, url: req.originalUrl, statusCode: res.statusCode, durationMs: Number(durationMs.toFixed(2)) }));
  });
  next();
};
