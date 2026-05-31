import type { YnabAccount, YnabBudget, YnabCategory, YnabTransaction } from "./ynab.js";

export interface ReadonlyYnabApi {
  listBudgets(): Promise<YnabBudget[]>;
  listAccounts(budgetId: string): Promise<YnabAccount[]>;
  listCategories(budgetId: string): Promise<YnabCategory[]>;
  listTransactions(budgetId: string, sinceDate?: string): Promise<YnabTransaction[]>;
}
