import type { YnabClient } from "../clients/ynab-client.js";
import { budgetIdInputSchema, listAccountsOutputSchema } from "../schemas/ynab.js";

export async function listAccounts(client: YnabClient, input: unknown) {
  const { budgetId } = budgetIdInputSchema.parse(input);
  const accounts = await client.listAccounts(budgetId);
  return listAccountsOutputSchema.parse(accounts);
}
