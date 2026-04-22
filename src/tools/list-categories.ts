import type { YnabClient } from "../clients/ynab-client.js";
import { budgetIdInputSchema, listCategoriesOutputSchema } from "../schemas/ynab.js";

export async function listCategories(client: YnabClient, input: unknown) {
  const { budgetId } = budgetIdInputSchema.parse(input);
  const categories = await client.listCategories(budgetId);
  return listCategoriesOutputSchema.parse(categories);
}
