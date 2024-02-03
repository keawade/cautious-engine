import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./env.js";

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT ?? 3000,
  },
  (address) => {
    console.log(`Listening on port ${address.port}.`);
  },
);

process.on("SIGTERM", () => {
  console.warn("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.warn("HTTP server closed");
  });
});
