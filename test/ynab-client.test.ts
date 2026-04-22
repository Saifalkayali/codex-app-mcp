import { describe, expect, it, vi } from "vitest";
import { YnabClient } from "../src/clients/ynab-client.js";
import { YnabApiError, YnabConfigError } from "../src/types/errors.js";

describe("YnabClient", () => {
  it("reads token from environment", () => {
    const client = YnabClient.fromEnv({ YNAB_TOKEN: "token" });
    expect(client).toBeInstanceOf(YnabClient);
  });

  it("throws when token is missing", () => {
    expect(() => YnabClient.fromEnv({})).toThrow(YnabConfigError);
  });

  it("retries rate-limited responses", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response("rate limited", {
          status: 429,
          headers: { "Retry-After": "0" }
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              budgets: [
                {
                  id: "budget-1",
                  name: "Home",
                  last_modified_on: "2026-04-01T00:00:00.000Z",
                  first_month: "2026-01-01",
                  last_month: "2026-12-01",
                  date_format: { format: "MM/DD/YYYY" },
                  currency_format: { iso_code: "USD" }
                }
              ]
            }
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" }
          }
        )
      );

    const client = new YnabClient({ token: "token", fetchImpl, maxRetries: 1 });
    const budgets = await client.listBudgets();

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(budgets[0]?.currencyFormat).toBe("USD");
  });

  it("throws a typed error for unrecoverable failures", async () => {
    const client = new YnabClient({
      token: "token",
      fetchImpl: vi.fn<typeof fetch>().mockResolvedValue(new Response("nope", { status: 401 }))
    });

    await expect(client.listBudgets()).rejects.toBeInstanceOf(YnabApiError);
  });
});
