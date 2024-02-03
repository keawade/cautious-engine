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

// If considering expanding this more it might be worth considering extracting
// each case out into their own functions so they can each be tested in full
// isolation

export const processReceipt = (receipt: Receipt): number => {
  let points = 0;

  // One point for every alphanumeric character in the retailer name.
  points += receipt.retailer
    .split("")
    .reduce((acc, curr) => (isAlphaNumeric(curr) ? acc + 1 : acc), 0);

  // 50 points if the total is a round dollar amount with no cents.
  if (Number(receipt.total) % 1 === 0) {
    points += 50;
  }

  // 25 points if the total is a multiple of 0.25.
  if (Number(receipt.total) % 0.25 === 0) {
    points += 25;
  }

  // 5 points for every two items on the receipt.
  points += 5 * Math.floor(receipt.items.length / 2);

  // If the trimmed length of the item description is a multiple of 3, multiply
  // the price by 0.2 and round up to the nearest integer. The result is the
  // number of points earned.
  for (const item of receipt.items) {
    const trimmed = item.shortDescription.trim();
    // The !== 0 check here is needed to narrow to multiples of three rather
    // than just cases where % 3 => 0 which includes 0 % 3 which is not a
    // multiple of 3.
    //
    // _Technically_ it doesn't matter currently because what we do inside this
    // case is to multiply by the trimmed length which, when it is 0, means we
    // get a correct value even without the !== 0 check.
    //
    // I'm leaving it in anyways because if we ever change the logic to not
    // multiply by the trimmed length we'll immediately see a bug here and it
    // may not be immediately obvious to the developer working on it unless
    // they're familiar with what has been described here.
    if (trimmed.length !== 0 && trimmed.length % 3 === 0) {
      points += Math.ceil(Number(item.price) * 0.2);
    }
  }

  // 6 points if the day in the purchase date is odd.
  if (Number(receipt.purchaseDate.split("-")[2]) % 2 === 1) {
    points += 6;
  }

  // 10 points if the time of purchase is after 2:00pm and before 4:00pm.
  if (
    Number(receipt.purchaseTime.split(":")[0]) >= 14 &&
    Number(receipt.purchaseTime.split(":")[0]) < 16
  ) {
    points += 10;
  }

  return points;
};
