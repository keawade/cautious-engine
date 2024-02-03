# Receipt processor service

The receipt processor service processes receipts to calculate point rewards. It
stores both the original receipt data and the calculated points and exposes
endpoints to retrieve them.

## Endpoints

### `GET /receipts/:id`

Returns the stored receipt record for the specified UUID.

### `GET /receipts/:id/points`

Returns the stored points for the receipt specified by the provided UUID.

### `POST /receipts/process`

Processes a provided receipt, calculating the point rewards, and storing both
the receipt data and the calculated points for retrieval via the other
endpoints.

```typescript
interface Body {
  retailer: string;
  purchaseDate: string; // Validation: `yyyy-MM-dd`
  purchaseTime: string; // Validation: `HH:mm`
  total: string; // Validation: Number with two decimals: 0.00, 1.00, 999.99
  items: Array<{
    shortDescription: string;
    price: string; // Validation: Number with two decimals: 0.00, 1.00, 999.99
  }>;
}
```

## Running the service

### Docker

If you have Docker installed, you can build and run with these commands:

```
docker build . -t receipt-processor:1
docker run -p 3000:3000 receipt-processor:1
```

### On bare metal

If you have Node.js v20+ installed, you can set up and run with these commands:

```shell
npm ci
npm run dev
```

## Tests

This repository comes with suites of unit and integration tests.

### Unit tests

Unit tests can be run by running `npm run test`.

### Integration tests

Integration tests can be run by running `npm run test:integration` after
starting a server either on bare metal or in Docker.
