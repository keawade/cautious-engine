import { describe, expect, it } from "vitest";
import { default as axios, AxiosError } from "axios";
import { Receipt } from "../../src/schema";

describe("Receipt processor service", () => {
  const axiosClient = axios.create({ baseURL: "http://localhost:3000/" });
  const simpleReceiptFixture = {
    retailer: "Target",
    purchaseDate: "2022-01-02",
    purchaseTime: "13:13",
    total: "1.25",
    items: [{ shortDescription: "Pepsi - 12-oz", price: "1.25" }],
  };

  describe("GET /receipts/:id", () => {
    it("should return a receipt record if it exists", async () => {
      const {
        data: { id },
      } = await axiosClient.post<{ id: string }>(
        "/receipts/process",
        simpleReceiptFixture,
      );

      const { data: actual } = await axiosClient.get<Receipt>(
        `/receipts/${id}`,
      );

      expect(actual).toStrictEqual({
        retailer: "Target",
        purchaseDate: "2022-01-02",
        purchaseTime: "13:13",
        total: 1.25,
        items: [{ shortDescription: "Pepsi - 12-oz", price: 1.25 }],
      });
    });

    it("should return 404 if receipt is not found", async () => {
      try {
        await axiosClient.get("/receipts/does-not-exist");
        throw "should have thrown an error";
      } catch (err) {
        expect(err).toBeInstanceOf(AxiosError);
        const axiosErr = err as AxiosError;
        expect(axiosErr.response?.status).toBe(404);
        expect(axiosErr.response?.data).toStrictEqual({ error: "Not found." });
      }
    });
  });

  describe("GET /receipts/:id/points", () => {
    it("should return points for a receipt if it exists", async () => {
      const {
        data: { id },
      } = await axiosClient.post<{ id: string }>(
        "/receipts/process",
        simpleReceiptFixture,
      );

      const { data: actual } = await axiosClient.get<{ points: number }>(
        `/receipts/${id}/points`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect(actual).toStrictEqual({ points: expect.any(Number) });
    });

    it("should return 404 if receipt is not found", async () => {
      try {
        await axiosClient.get("/receipts/does-not-exist/points");
        throw "should have thrown an error";
      } catch (err) {
        expect(err).toBeInstanceOf(AxiosError);
        const axiosErr = err as AxiosError;
        expect(axiosErr.response?.status).toBe(404);
        expect(axiosErr.response?.data).toStrictEqual({ error: "Not found." });
      }
    });
  });

  describe("POST /receipts/process", () => {
    it("should process a receipt without error", async () => {
      const { data: actual } = await axiosClient.post<{ id: string }>(
        "/receipts/process",
        simpleReceiptFixture,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expect(actual).toStrictEqual({ id: expect.any(String) });
    });

    describe("business logic smoke tests", () => {
      it("should process an example receipt to the number of points", async () => {
        const {
          data: { id },
        } = await axiosClient.post<{ id: string }>("/receipts/process", {
          retailer: "Target",
          purchaseDate: "2022-01-01",
          purchaseTime: "13:01",
          items: [
            { shortDescription: "Mountain Dew 12PK", price: "6.49" },
            { shortDescription: "Emils Cheese Pizza", price: "12.25" },
            { shortDescription: "Knorr Creamy Chicken", price: "1.26" },
            { shortDescription: "Doritos Nacho Cheese", price: "3.35" },
            {
              shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ",
              price: "12.00",
            },
          ],
          total: "35.35",
        });

        const {
          data: { points },
        } = await axiosClient.get<{ points: number }>(`/receipts/${id}/points`);

        expect(points).toBe(28);
      });

      it("should process an example receipt to the correct number of points", async () => {
        const {
          data: { id },
        } = await axiosClient.post<{ id: string }>("/receipts/process", {
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
        });

        const {
          data: { points },
        } = await axiosClient.get<{ points: number }>(`/receipts/${id}/points`);

        expect(points).toBe(109);
      });
    });
  });
});
