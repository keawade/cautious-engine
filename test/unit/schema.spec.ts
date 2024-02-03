import { describe, it, expect } from "vitest";
import {
  numberWithTwoDecimalsRegex,
  receiptSchema,
  Receipt,
} from "../../src/schema.js";
import { ZodError } from "zod";

describe("schema", () => {
  describe("receiptSchema", () => {
    it("should parse simple receipt", () => {
      const fixture = {
        retailer: "Target",
        purchaseDate: "2022-01-02",
        purchaseTime: "13:13",
        total: "1.25",
        items: [{ shortDescription: "Pepsi - 12-oz", price: "1.25" }],
      };

      const actual = receiptSchema.safeParse(fixture);

      expect(actual.success).toBe(true);
      expect((actual as { data: Receipt }).data).toStrictEqual({
        retailer: "Target",
        purchaseDate: "2022-01-02",
        purchaseTime: "13:13",
        total: 1.25,
        items: [{ shortDescription: "Pepsi - 12-oz", price: 1.25 }],
      });
    });

    it("should parse morning receipt", () => {
      const fixture = {
        retailer: "Walgreens",
        purchaseDate: "2022-01-02",
        purchaseTime: "08:13",
        total: "2.65",
        items: [
          { shortDescription: "Pepsi - 12-oz", price: "1.25" },
          { shortDescription: "Dasani", price: "1.40" },
        ],
      };

      const actual = receiptSchema.safeParse(fixture);

      expect(actual.success).toBe(true);
      expect((actual as { data: Receipt }).data).toStrictEqual({
        retailer: "Walgreens",
        purchaseDate: "2022-01-02",
        purchaseTime: "08:13",
        total: 2.65,
        items: [
          { shortDescription: "Pepsi - 12-oz", price: 1.25 },
          { shortDescription: "Dasani", price: 1.4 },
        ],
      });
    });

    it("should parse example receipt", () => {
      const fixture = {
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        items: [
          { shortDescription: "Mountain Dew 12PK", price: "6.49" },
          { shortDescription: "Emils Cheese Pizza", price: "12.25" },
          { shortDescription: "Knorr Creamy Chicken", price: "1.26" },
          { shortDescription: "Doritos Nacho Cheese", price: "3.35" },
          { shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ", price: "12.00" },
        ],
        total: "35.35",
      };

      const actual = receiptSchema.safeParse(fixture);

      expect(actual.success).toBe(true);
      expect((actual as { data: Receipt }).data).toStrictEqual({
        retailer: "Target",
        purchaseDate: "2022-01-01",
        purchaseTime: "13:01",
        total: 35.35,
        items: [
          { shortDescription: "Mountain Dew 12PK", price: 6.49 },
          { shortDescription: "Emils Cheese Pizza", price: 12.25 },
          { shortDescription: "Knorr Creamy Chicken", price: 1.26 },
          { shortDescription: "Doritos Nacho Cheese", price: 3.35 },
          { shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ", price: 12 },
        ],
      });
    });

    it("should parse example receipt", () => {
      const fixture = {
        retailer: "M&M Corner Market",
        purchaseDate: "2022-03-20",
        purchaseTime: "14:33",
        items: [
          { shortDescription: "Gatorade", price: "2.25" },
          { shortDescription: "Gatorade", price: "2.25" },
          { shortDescription: "Gatorade", price: "2.25" },
          { shortDescription: "Gatorade", price: "2.25" },
        ],
        total: "9.00",
      };

      const actual = receiptSchema.safeParse(fixture);

      expect(actual.success).toBe(true);
      expect((actual as { data: Receipt }).data).toStrictEqual({
        retailer: "M&M Corner Market",
        purchaseDate: "2022-03-20",
        purchaseTime: "14:33",
        total: 9,
        items: [
          { shortDescription: "Gatorade", price: 2.25 },
          { shortDescription: "Gatorade", price: 2.25 },
          { shortDescription: "Gatorade", price: 2.25 },
          { shortDescription: "Gatorade", price: 2.25 },
        ],
      });
    });

    it.each([
      "2021-02-01",
      "2022-03-23",
      "9999-01-02",
      "2024-02-02",
      "2023-12-15",
      "2023-09-20",
      "2023-06-07",
      "2023-03-12",
      "2022-11-25",
      "2022-08-08",
      "2022-05-01",
      "2022-02-14",
      "2021-10-30",
      "0001-01-01",
      "2024-02-29",
    ])("should validate %s as a valid purchaseDate", (dateString) => {
      const fixture = {
        retailer: "Walgreens",
        purchaseDate: dateString,
        purchaseTime: "08:13",
        total: "2.65",
        items: [
          { shortDescription: "Pepsi - 12-oz", price: "1.25" },
          { shortDescription: "Dasani", price: "1.40" },
        ],
      };

      expect(() => receiptSchema.parse(fixture)).not.toThrow();
    });

    it.each([
      "9999-99-99",
      "2024-13-02",
      "2023-00-15",
      "2023-09-32",
      "2023-06-00",
      "2023-03-45",
      "2022-11-00",
      "2022-15-08",
      "2022-05-32",
      "2021-00-30",
      "2022-02-29",
      "2022-02-30",
      "2024-02-31",
      "foo",
      "bar",
      "howdy",
    ])("should not validate %s as a valid purchaseDate", (dateString) => {
      const fixture = {
        retailer: "Walgreens",
        purchaseDate: dateString,
        purchaseTime: "08:13",
        total: "2.65",
        items: [
          { shortDescription: "Pepsi - 12-oz", price: "1.25" },
          { shortDescription: "Dasani", price: "1.40" },
        ],
      };

      try {
        receiptSchema.parse(fixture);
        throw "Should have thrown an error";
      } catch (err) {
        expect(err).toBeInstanceOf(ZodError);
        const zodErr = err as ZodError;
        expect(zodErr.errors).toEqual([
          {
            code: "custom",
            message: "Invalid date.",
            path: ["purchaseDate"],
          },
        ]);
      }
    });

    it.each(["00:00", "02:01", "12:00", "09:59", "23:59", "02:59"])(
      "should parse %s as a valid purchaseTime",
      (timeString) => {
        const fixture = {
          retailer: "Walgreens",
          purchaseDate: "2022-01-02",
          purchaseTime: timeString,
          total: "2.65",
          items: [
            { shortDescription: "Pepsi - 12-oz", price: "1.25" },
            { shortDescription: "Dasani", price: "1.40" },
          ],
        };

        expect(() => receiptSchema.parse(fixture)).not.toThrow();
      },
    );

    it.each([
      "25:00",
      "24:59",
      "24:00",
      "24:01",
      "01:60",
      "02:61",
      "foo",
      "bar",
      "howdy",
    ])("should not parse %s as a valid purchaseDate", (timeString) => {
      const fixture = {
        retailer: "Walgreens",
        purchaseDate: "2022-01-02",
        purchaseTime: timeString,
        total: "2.65",
        items: [
          { shortDescription: "Pepsi - 12-oz", price: "1.25" },
          { shortDescription: "Dasani", price: "1.40" },
        ],
      };

      try {
        receiptSchema.parse(fixture);
        throw "Should have thrown an error";
      } catch (err) {
        expect(err).toBeInstanceOf(ZodError);
        const zodErr = err as ZodError;
        expect(zodErr.errors).toEqual([
          {
            code: "custom",
            message: "Invalid time.",
            path: ["purchaseTime"],
          },
        ]);
      }

      // I could add more negative test cases here but with the existing cases
      // passing and Zod's strong typing I know that both the structure is correct
      // and the transformations are working as expected.
      //
      // With that confirmed, I don't think there is much to be gained by adding
      // negative case unit tests here at the moment as the cases I would add
      // would be testing that Zod functions as advertised and not my use of Zod.
    });

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
  });
});
