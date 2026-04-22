import type { YnabClient } from "../clients/ynab-client.js";
import { monthlySpendByCategoryOutputSchema, monthlySpendInputSchema } from "../schemas/ynab.js";

export async function monthlySpendByCategory(client: YnabClient, input: unknown) {
  const { budgetId, month } = monthlySpendInputSchema.parse(input);
  const categories = await client.listCategories(budgetId);
  const transactions = await client.listTransactions(budgetId, `${month}-01`);

  const categoryIndex = new Map(
    categories
      .filter((category) => !category.deleted)
      .map((category) => [
        category.id,
        {
          categoryName: category.name,
          categoryGroupName: category.categoryGroupName
        }
      ])
  );

  const totals = new Map<
    string,
    {
      month: string;
      categoryId: string;
      categoryName: string;
      categoryGroupName: string;
      transactionCount: number;
      totalOutflow: number;
    }
  >();

  for (const transaction of transactions) {
    if (transaction.deleted || transaction.categoryId === null || !transaction.date.startsWith(month)) {
      continue;
    }

    if (transaction.amount >= 0) {
      continue;
    }

    const category = categoryIndex.get(transaction.categoryId);

    if (!category) {
      continue;
    }

    const current = totals.get(transaction.categoryId) ?? {
      month,
      categoryId: transaction.categoryId,
      categoryName: category.categoryName,
      categoryGroupName: category.categoryGroupName,
      transactionCount: 0,
      totalOutflow: 0
    };

    current.transactionCount += 1;
    current.totalOutflow += Math.abs(transaction.amount);
    totals.set(transaction.categoryId, current);
  }

  const result = Array.from(totals.values()).sort((left, right) => right.totalOutflow - left.totalOutflow);
  return monthlySpendByCategoryOutputSchema.parse(result);
}
