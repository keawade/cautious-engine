import { add, getDate, getHours } from "date-fns";
import { Receipt } from "../schema.js";

const isAlphaNumeric = (str: string) => {
  const char = str.charCodeAt(0);
  if (
    !(char > 47 && char < 58) && // numeric (0-9)
    !(char > 64 && char < 91) && // upper alpha (A-Z)
    !(char > 96 && char < 123) // lower alpha (a-z)
  ) {
    return false;
  }
  return true;
};

export const processReceipt = (receipt: Receipt): number => {
  let points = 0;

  // One point for every alphanumeric character in the retailer name.
  points += receipt.retailer
    .split("")
    .reduce((acc, curr) => (isAlphaNumeric(curr) ? acc + 1 : acc), 0);

  // 50 points if the total is a round dollar amount with no cents.
  if (receipt.total % 1 === 0) {
    points += 50;
  }

  // 25 points if the total is a multiple of 0.25.
  if (receipt.total % 0.25 === 0) {
    points += 25;
  }

  // 5 points for every two items on the receipt.
  points += 5 * Math.floor(receipt.items.length / 2);

  // If the trimmed length of the item description is a multiple of 3, multiply
  // the price by 0.2 and round up to the nearest integer. The result is the
  // number of points earned.
  for (const item of receipt.items) {
    if (item.shortDescription.trim().length % 3 === 0) {
      points += Math.ceil(item.price * 0.2);
    }
  }

  // 6 points if the day in the purchase date is odd.
  if (getDate(receipt.purchaseDateTime) % 2 === 1) {
    points += 6;
  }

  // 10 points if the time of purchase is after 2:00pm and before 4:00pm.
  if (
    // Super conflicted on this. On the one hand, converting to a Date object
    // earlier makes several other things in this service feel a lot nicer.
    // However this logic in particular got pretty hairy due to timezone
    // offsets.
    //
    // See https://xkcd.com/2867/ for vibes.
    getHours(
      add(receipt.purchaseDateTime, {
        minutes: receipt.purchaseDateTime.getTimezoneOffset(),
      }),
    ) >= 14 &&
    getHours(
      add(receipt.purchaseDateTime, {
        minutes: receipt.purchaseDateTime.getTimezoneOffset(),
      }),
    ) < 16
  ) {
    points += 10;
  }

  return points;
};
