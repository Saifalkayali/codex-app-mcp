import { budgetIdInputSchema, listAccountsOutputSchema } from "../schemas/ynab.js";
import type { ReadonlyYnabApi } from "../types/client.js";

export async function listAccounts(client: ReadonlyYnabApi, input: unknown) {
  const { budgetId } = budgetIdInputSchema.parse(input);
  const accounts = await client.listAccounts(budgetId);
  return listAccountsOutputSchema.parse(accounts);
}
