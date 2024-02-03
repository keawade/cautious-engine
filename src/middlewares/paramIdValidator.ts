import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const paramIdValidator = zValidator(
  "param",
  z.object({ id: z.string().uuid() }),
  (result, c) => {
    if (!result.success) {
      return c.json({ error: "Invalid ID param." }, 400);
    }
  },
);
