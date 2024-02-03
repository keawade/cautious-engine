import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { Receipt, receiptSchema } from "./schema.js";
import { processReceipt } from "./businessLogic/processReceipt.js";
import { randomUUID } from "node:crypto";

const storage = new Map<string, { receipt: Receipt; points: number }>();

const app = new Hono();

app.use("*", logger(), prettyJSON());

app.post("/receipts/process", async (c) => {
  const receipt = receiptSchema.safeParse(await c.req.json());

  if (!receipt.success) {
    return c.json(
      {
        error: "Invalid data.",
        info: receipt.error,
      },
      400,
    );
  }

  const points = processReceipt(receipt.data);
  const id = randomUUID();

  storage.set(id, { receipt: receipt.data, points });

  return c.json({ id, points });
});

app.get("/receipts/:id", (c) => {
  const record = storage.get(c.req.param("id"));

  if (!record) {
    return c.json({ error: "Not found." }, 404);
  }

  return c.json(record.receipt);
});

app.get("/receipts/:id/points", (c) => {
  const record = storage.get(c.req.param("id"));

  if (!record) {
    return c.json({ error: "Not found." }, 404);
  }

  return c.json({ points: record.points });
});

export { app };
