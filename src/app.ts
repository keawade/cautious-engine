import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { Receipt, receiptJsonValidator } from "./schema.js";
import { processReceipt } from "./businessLogic/processReceipt.js";
import { randomUUID } from "node:crypto";
import { paramIdValidator } from "./middlewares/paramIdValidator.js";

const storage = new Map<string, { receipt: Receipt; points: number }>();

const app = new Hono();

app.use("*", logger(), prettyJSON());

app.post("/receipts/process", receiptJsonValidator, (c) => {
  const points = processReceipt(c.req.valid("json"));
  const id = randomUUID();

  storage.set(id, { receipt: c.req.valid("json"), points });

  return c.json({ id });
});

app.get("/receipts/:id", paramIdValidator, (c) => {
  const record = storage.get(c.req.valid("param").id);

  if (!record) {
    return c.json({ error: "Not found." }, 404);
  }

  return c.json(record.receipt);
});

app.get("/receipts/:id/points", paramIdValidator, (c) => {
  const record = storage.get(c.req.valid("param").id);

  if (!record) {
    return c.json({ error: "Not found." }, 404);
  }

  return c.json({ points: record.points });
});

export { app };
