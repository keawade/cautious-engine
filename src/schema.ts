import { isValid, parse, set } from "date-fns";
import { z } from "zod";

export const numberWithTwoDecimalsRegex = /^[0-9]+\.[0-9]{2}$/;

const referenceDate = set(new Date(), {
  year: 2024,
  month: 0,
  date: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  milliseconds: 0,
});

export const receiptSchema = z
  .object({
    retailer: z.string(),
    purchaseDate: z
      .string()
      .refine(
        (dateStr) => isValid(parse(dateStr, "yyyy-MM-dd", referenceDate)),
        { message: "Invalid date." },
      ),
    purchaseTime: z
      .string()
      .refine((timeStr) => isValid(parse(timeStr, "HH:mm", referenceDate)), {
        message: "Invalid time.",
      }),
    // TODO: Ask if should disallow totals that don't equal the sum of items
    // Note: Disallowing totals that don't equal the sum of items would make a
    // mess of some existing unit tests that depend on the current flexibility
    // to isolate point calculation cases
    // TODO: Ask if should disallow negative totals
    total: z
      .string()
      .regex(numberWithTwoDecimalsRegex, { message: "Invalid total." }),
    items: z.array(
      z.object({
        shortDescription: z.string(),
        // TODO: Ask if should disallow negative prices
        price: z
          .string()
          .regex(numberWithTwoDecimalsRegex, { message: "Invalid price." }),
      }),
    ),
  })
  .transform((receipt) => ({
    ...receipt,
    total: Number(receipt.total),
    items: receipt.items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  }));
export type Receipt = z.infer<typeof receiptSchema>;
