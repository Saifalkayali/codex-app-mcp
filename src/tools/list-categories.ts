import { budgetIdInputSchema, listCategoriesOutputSchema } from "../schemas/ynab.js";
import type { ReadonlyYnabApi } from "../types/client.js";

export async function listCategories(client: ReadonlyYnabApi, input: unknown) {
  const { budgetId } = budgetIdInputSchema.parse(input);
  const categories = await client.listCategories(budgetId);
  return listCategoriesOutputSchema.parse(categories);
}
