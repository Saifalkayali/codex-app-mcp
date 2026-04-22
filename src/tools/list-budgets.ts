import { listBudgetsOutputSchema } from "../schemas/ynab.js";
import type { YnabClient } from "../clients/ynab-client.js";

export async function listBudgets(client: YnabClient) {
  const budgets = await client.listBudgets();
  return listBudgetsOutputSchema.parse(budgets);
}
