import { expect, test } from "vitest";
import { z } from "zod/v4";

test("what", () => {
  const X = z.string().datetime({
    local: true,
  });

  const result = X.safeParse("2025-07-12T22:04:04.23482");
  expect(result.success).toBeTruthy();
});
