import { describe, expect, it } from "vitest";
import { processReceipt } from "../../src/businessLogic/processReceipt";
import { Receipt } from "../../src/schema";

describe("processReceipt", () => {
  it("should process a receipt", () => {
    const fixture: Receipt = {
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
    };

    const actual = processReceipt(fixture);

    expect(actual).toBe(28);
  });

  it("should process a receipt", () => {
    const fixture: Receipt = {
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
    };

    const actual = processReceipt(fixture);

    expect(actual).toBe(109);
  });

  describe("individual rules", () => {
    it.each([
      // All entries should have value score of 4 for this test.
      "test",
      "Test",
      "T123",
      "t123",
      "T E S T",
      "!@#$%^&*()_+{}'\"<>,./?\\Test",
    ])(
      "should add one point for every alphanumeric character in the retailer name",
      (retailer) => {
        const fixture = {
          retailer,
          purchaseDate: "2022-01-02",
          purchaseTime: "00:00",
          total: 0.1,
          items: [],
        };

        expect(processReceipt(fixture)).toBe(4);
      },
    );

    it.each([1, 2, 3, 4, 5, 100, 1000, 99999999])(
      "should add 50 points if the total is a round number with no cents",
      (total) => {
        const fixture = {
          retailer: "",
          purchaseDate: "2022-01-02",
          purchaseTime: "00:00",
          total,
          items: [],
        };

        // This case overlaps with the next one which is why there is 25 extra here.
        expect(processReceipt(fixture)).toBe(50 + 25);
      },
    );

    it.each([0.25, 0.5, 0.75, 999999.25, 99999999.75])(
      "should add 25 points if the total is a multiple of 0.25",
      (total) => {
        const fixture = {
          retailer: "",
          purchaseDate: "2022-01-02",
          purchaseTime: "00:00",
          total,
          items: [],
        };

        expect(processReceipt(fixture)).toBe(25);
      },
    );

    it.each([
      [0, 0],
      [1, 0],
      [2, 5],
      [3, 5],
      [4, 10],
      [5, 10],
      [10, 25],
      [25, 60],
      [42, 105],
    ])(
      "should add 5 points for every two items on the receipt",
      (itemCount, points) => {
        const fixture = {
          retailer: "",
          purchaseDate: "2022-01-02",
          purchaseTime: "00:00",
          total: 0.1,
          items: new Array(itemCount).fill({
            shortDescription: "",
            price: 0,
          }),
        };

        expect(processReceipt(fixture)).toBe(points);
      },
    );

    it.each([
      ["Sup", 1, 1],
      ["       Sup       \t\t", 1, 1],
      ["This is only a test!!", 1, 1],
      ["Sup", 6, 2],
      ["       Sup       \t\t", 6, 2],
      ["This is only a test!!", 6, 2],
      ["Sup", 100, 20],
      ["       Sup       \t\t", 100, 20],
      ["This is only a test!!", 100, 20],
    ])(
      "should add `price * 0.2` rounded up if trimmed length of item description is a multiple of 3",
      (shortDescription, price, points) => {
        const fixture = {
          retailer: "",
          purchaseDate: `2022-01-02`,
          purchaseTime: "00:00",
          total: 0.1,
          items: [{ shortDescription, price }],
        };

        expect(processReceipt(fixture)).toBe(points);
      },
    );

    it.each(["01", "03", "05", "11", "13", "43"])(
      "should add 6 points if the day in the purchase date is odd",
      (day) => {
        const fixture = {
          retailer: "",
          purchaseDate: `2022-01-${day}`,
          purchaseTime: "00:00",
          total: 0.1,
          items: [],
        };

        expect(processReceipt(fixture)).toBe(6);
      },
    );

    it.each(["02", "04", "06", "12", "14", "42"])(
      "should not add 6 points if the day in the purchase date is even",
      (day) => {
        const fixture = {
          retailer: "",
          purchaseDate: `2022-01-${day}`,
          purchaseTime: "00:00",
          total: 0.1,
          items: [],
        };

        expect(processReceipt(fixture)).toBe(0);
      },
    );

    it.each(["14:00", "14:01", "15:00", "15:59"])(
      "should add 10 points if the time of purchase is after 2:00pm and before 4:00pm",
      (purchaseTime) => {
        const fixture = {
          retailer: "",
          purchaseDate: `2022-01-02`,
          purchaseTime,
          total: 0.1,
          items: [],
        };

        expect(processReceipt(fixture)).toBe(10);
      },
    );

    it.each(["13:59", "16:00", "00:00", "02:42", "18:58"])(
      "should not add 10 points if the time of purchase is not after 2:00pm and before 4:00pm",
      (purchaseTime) => {
        const fixture = {
          retailer: "",
          purchaseDate: `2022-01-02`,
          purchaseTime,
          total: 0.1,
          items: [],
        };

        expect(processReceipt(fixture)).toBe(0);
      },
    );
  });
});
