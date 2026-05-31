import { budgetWithDaysInputSchema, listRecentTransactionsOutputSchema } from "../schemas/ynab.js";
import type { ReadonlyYnabApi } from "../types/client.js";
import { daysAgoIsoDate } from "./date.js";

export async function listRecentTransactions(client: ReadonlyYnabApi, input: unknown) {
  const { budgetId, days } = budgetWithDaysInputSchema.parse(input);
  const sinceDate = daysAgoIsoDate(days);
  const transactions = await client.listTransactions(budgetId, sinceDate);
  return listRecentTransactionsOutputSchema.parse(transactions);
}
