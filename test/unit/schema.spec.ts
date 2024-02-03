import { describe, it, expect } from "vitest";
import {
  numberWithTwoDecimalsRegex,
  receiptSchema,
  Receipt,
} from "../../src/schema.js";

describe("schema", () => {
  describe("numberWithTwoDecimalsRegex", () => {
    it.each(["0.00", "0.01", "1.00", "00000.00", "9999999999.99"])(
      "should parse %s as a valid number with two decimals",
      (timeString) => {
        expect(numberWithTwoDecimalsRegex.test(timeString)).toBe(true);
      },
    );

    it.each([
      "99",
      "0",
      ".01",
      ".99",
      "123",
      "this is only a test",
      "foo",
      "bar",
      "howdy",
    ])(
      "should not parse %s as a valid number with two decimals",
      (timeString) => {
        expect(numberWithTwoDecimalsRegex.test(timeString)).toBe(false);
      },
    );
  });

  // Sanity check full schema
  describe("receiptSchema", () => {
    it("should parse simple receipt", () => {
      const input = {
        retailer: "Target",
        purchaseDate: "2022-01-02",
        purchaseTime: "13:13",
        total: "1.25",
        items: [{ shortDescription: "Pepsi - 12-oz", price: "1.25" }],
      };

      const actual = receiptSchema.safeParse(input);

      expect(actual.success).toBe(true);
      expect((actual as { data: Receipt }).data).toStrictEqual({
        retailer: "Target",
        purchaseDateTime: new Date("2022-01-02T13:13:00.000Z"),
        total: 1.25,
        items: [{ shortDescription: "Pepsi - 12-oz", price: 1.25 }],
      });
    });

    it("should parse morning receipt", () => {
      const input = {
        retailer: "Walgreens",
        purchaseDate: "2022-01-02",
        purchaseTime: "08:13",
        total: "2.65",
        items: [
          { shortDescription: "Pepsi - 12-oz", price: "1.25" },
          { shortDescription: "Dasani", price: "1.40" },
        ],
      };

      const actual = receiptSchema.safeParse(input);

      expect(actual.success).toBe(true);
      expect((actual as { data: Receipt }).data).toStrictEqual({
        retailer: "Walgreens",
        purchaseDateTime: new Date("2022-01-02T08:13:00.000Z"),
        total: 2.65,
        items: [
          { shortDescription: "Pepsi - 12-oz", price: 1.25 },
          { shortDescription: "Dasani", price: 1.4 },
        ],
      });
    });

    it.todo("should validate date strings");

    it.todo("should validate time strings");

    // I could add negative test cases here but with the positive cases passing
    // and Zod's strong typing I know that both the structure is correct and
    // that my transformations are working as expected.
    //
    // With that confirmed, I don't think there is much to be gained by adding
    // negative case unit tests here at the moment as the cases I would add
    // would be testing that Zod functions as advertised and not my use of Zod.
  });
});
