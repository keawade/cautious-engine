// This file is a utility to provide typesafe access to env vars by passing them
// through Zod schema validation first.

import { z } from "zod";
import type { ZodFormattedError } from "zod";

const envVariables = z.object({
  PORT: z.coerce.number().optional(),
});

const formatErrors = (
  errors: ZodFormattedError<Map<string, string>, string>,
) => {
  const collectedErrors = [...errors._errors];

  Object.entries(errors).map(([name, value]) => {
    if (value && "_errors" in value) {
      collectedErrors.push(`${name}: ${value._errors.join(", ")}\n`);
    }
  });

  return collectedErrors;
};

const validatedEnv = envVariables.safeParse(process.env);
if (!validatedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(formatErrors(validatedEnv.error.format()), null, 4),
  );
  throw new Error("Invalid environment variables");
} else {
  console.info(
    "✅ Validated environment variables:\n",
    JSON.stringify(validatedEnv.data, null, 2),
  );
}

export const env = validatedEnv.data;
