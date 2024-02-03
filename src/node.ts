import { serve } from "@hono/node-server";
import { app } from "./app.js";

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (address) => {
    console.log(`Listening on port ${address.port}.`);
  },
);
