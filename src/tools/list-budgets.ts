import { listBudgetsOutputSchema } from "../schemas/ynab.js";
import type { ReadonlyYnabApi } from "../types/client.js";

export async function listBudgets(client: ReadonlyYnabApi) {
  const budgets = await client.listBudgets();
  return listBudgetsOutputSchema.parse(budgets);
}
