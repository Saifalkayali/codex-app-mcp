import type { YnabClient } from "../clients/ynab-client.js";
import { budgetWithDaysInputSchema, listRecentTransactionsOutputSchema } from "../schemas/ynab.js";

export async function listRecentTransactions(client: YnabClient, input: unknown) {
  const { budgetId, days } = budgetWithDaysInputSchema.parse(input);
  const sinceDate = toSinceDate(days);
  const transactions = await client.listTransactions(budgetId, sinceDate);
  return listRecentTransactionsOutputSchema.parse(transactions);
}

function toSinceDate(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}
