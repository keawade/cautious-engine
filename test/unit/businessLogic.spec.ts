import { describe, expect, it } from "vitest";
import { processReceipt } from "../../src/businessLogic/processReceipt";
import { Receipt } from "../../src/schema";

describe("processReceipt", () => {
  it("should process a receipt", () => {
    const fixture: Receipt = {
      retailer: "Target",
      purchaseDateTime: new Date("2022-01-01T13:01:00.000Z"),
      total: 35.35,
      items: [
        { shortDescription: "Mountain Dew 12PK", price: 6.49 },
        { shortDescription: "Emils Cheese Pizza", price: 12.25 },
        { shortDescription: "Knorr Creamy Chicken", price: 1.26 },
        { shortDescription: "Doritos Nacho Cheese", price: 3.35 },
        { shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ", price: 12 },
      ],
    };

    const actual = processReceipt(fixture);

    expect(actual).toBe(28);
  });

  it("should process a receipt", () => {
    const fixture: Receipt = {
      retailer: "M&M Corner Market",
      purchaseDateTime: new Date("2022-03-20T14:33:00.000Z"),
      total: 9,
      items: [
        { shortDescription: "Gatorade", price: 2.25 },
        { shortDescription: "Gatorade", price: 2.25 },
        { shortDescription: "Gatorade", price: 2.25 },
        { shortDescription: "Gatorade", price: 2.25 },
      ],
    };

    const actual = processReceipt(fixture);

    expect(actual).toBe(109);
  });
});
