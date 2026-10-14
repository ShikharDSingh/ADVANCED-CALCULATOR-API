import app from "./app";
import { env } from "./config/env";
const server = app.listen(env.PORT, () => console.log(`Calculator API listening on port ${env.PORT} (${env.NODE_ENV})`));
const shutdown = (signal: string) => {
  console.log(`${signal} received; shutting down server`);
  server.close(() => process.exit(0));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
