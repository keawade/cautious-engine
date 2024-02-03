import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./env.js";

serve(
  {
    fetch: app.fetch,
    port: env.PORT ?? 3000,
  },
  (address) => {
    console.log(`Listening on port ${address.port}.`);
  },
);
