import {
  budgetIdInputSchema,
  budgetWithDaysInputSchema,
  findUncategorizedTransactionsOutputSchema,
  listAccountsOutputSchema,
  listBudgetsOutputSchema,
  listCategoriesOutputSchema,
  listRecentTransactionsOutputSchema,
  monthlySpendByCategoryOutputSchema,
  monthlySpendInputSchema,
  noInputSchema
} from "../schemas/ynab.js";
import {
  findUncategorizedTransactions,
  listAccounts,
  listBudgets,
  listCategories,
  listRecentTransactions,
  monthlySpendByCategory
} from "../tools/index.js";
import type { ReadonlyYnabApi } from "../types/client.js";
import type { ReadonlyToolDefinition } from "../types/server.js";

export function buildReadonlyToolDefinitions(client: ReadonlyYnabApi): ReadonlyToolDefinition[] {
  return [
    {
      name: "listBudgets",
      description: "List all YNAB budgets accessible with the configured token.",
      inputSchema: noInputSchema,
      outputSchema: listBudgetsOutputSchema,
      execute: async () => listBudgets(client)
    },
    {
      name: "listAccounts",
      description: "List accounts for a specific YNAB budget.",
      inputSchema: budgetIdInputSchema,
      outputSchema: listAccountsOutputSchema,
      execute: async (input) => listAccounts(client, input)
    },
    {
      name: "listCategories",
      description: "List categories and category groups for a specific YNAB budget.",
      inputSchema: budgetIdInputSchema,
      outputSchema: listCategoriesOutputSchema,
      execute: async (input) => listCategories(client, input)
    },
    {
      name: "listRecentTransactions",
      description: "List recent transactions for a budget using a trailing day window.",
      inputSchema: budgetWithDaysInputSchema,
      outputSchema: listRecentTransactionsOutputSchema,
      execute: async (input) => listRecentTransactions(client, input)
    },
    {
      name: "findUncategorizedTransactions",
      description: "Find recent transactions that do not have a category assigned.",
      inputSchema: budgetWithDaysInputSchema,
      outputSchema: findUncategorizedTransactionsOutputSchema,
      execute: async (input) => findUncategorizedTransactions(client, input)
    },
    {
      name: "monthlySpendByCategory",
      description: "Summarize monthly outflow by category for a given YYYY-MM month.",
      inputSchema: monthlySpendInputSchema,
      outputSchema: monthlySpendByCategoryOutputSchema,
      execute: async (input) => monthlySpendByCategory(client, input)
    }
  ];
}
