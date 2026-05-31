import { budgetWithDaysInputSchema, findUncategorizedTransactionsOutputSchema } from "../schemas/ynab.js";
import type { ReadonlyYnabApi } from "../types/client.js";
import { daysAgoIsoDate } from "./date.js";

export async function findUncategorizedTransactions(client: ReadonlyYnabApi, input: unknown) {
  const { budgetId, days } = budgetWithDaysInputSchema.parse(input);
  const sinceDate = daysAgoIsoDate(days);
  const transactions = await client.listTransactions(budgetId, sinceDate);

  const uncategorized = transactions
    .filter((transaction) => !transaction.deleted)
    .filter((transaction) => transaction.categoryId === null)
    .map((transaction) => ({
      ...transaction,
      reason: "missing_category" as const
    }));

  return findUncategorizedTransactionsOutputSchema.parse(uncategorized);
}
