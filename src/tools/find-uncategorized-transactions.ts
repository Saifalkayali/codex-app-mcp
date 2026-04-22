import type { YnabClient } from "../clients/ynab-client.js";
import { budgetWithDaysInputSchema, findUncategorizedTransactionsOutputSchema } from "../schemas/ynab.js";

export async function findUncategorizedTransactions(client: YnabClient, input: unknown) {
  const { budgetId, days } = budgetWithDaysInputSchema.parse(input);
  const sinceDate = toSinceDate(days);
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

function toSinceDate(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
