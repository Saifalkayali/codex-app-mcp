import type { ReadonlyYnabApi } from "../src/types/client.js";
import { describe, expect, it } from "vitest";
import { buildReadonlyToolDefinitions } from "../src/server/tool-definitions.js";
import {
  findUncategorizedTransactions,
  listAccounts,
  listBudgets,
  listCategories,
  listRecentTransactions,
  monthlySpendByCategory
} from "../src/tools/index.js";
import type { YnabAccount, YnabBudget, YnabCategory, YnabTransaction } from "../src/types/ynab.js";

const budgets: YnabBudget[] = [
  {
    id: "budget-1",
    name: "Household",
    lastModifiedOn: "2026-04-01T00:00:00.000Z",
    firstMonth: "2026-01-01",
    lastMonth: "2026-12-01",
    dateFormat: "MM/DD/YYYY",
    currencyFormat: "USD"
  }
];

const accounts: YnabAccount[] = [
  {
    id: "account-1",
    name: "Checking",
    type: "checking",
    onBudget: true,
    closed: false,
    note: null,
    balance: 150_000,
    clearedBalance: 150_000,
    unclearedBalance: 0,
    transferPayeeId: null,
    deleted: false
  }
];

const categories: YnabCategory[] = [
  {
    id: "category-1",
    categoryGroupId: "group-1",
    categoryGroupName: "Living",
    name: "Groceries",
    hidden: false,
    originalCategoryGroupId: null,
    note: null,
    budgeted: 50_000,
    activity: -12_500,
    balance: 37_500,
    deleted: false
  },
  {
    id: "category-2",
    categoryGroupId: "group-1",
    categoryGroupName: "Living",
    name: "Rent",
    hidden: false,
    originalCategoryGroupId: null,
    note: null,
    budgeted: 150_000,
    activity: -100_000,
    balance: 50_000,
    deleted: false
  }
];

const transactions: YnabTransaction[] = [
  {
    id: "transaction-1",
    date: "2026-04-05",
    amount: -12_500,
    memo: "Market run",
    cleared: "cleared",
    approved: true,
    flagColor: null,
    accountId: "account-1",
    accountName: "Checking",
    payeeId: "payee-1",
    payeeName: "Store",
    categoryId: "category-1",
    categoryName: "Groceries",
    transferAccountId: null,
    transferTransactionId: null,
    matchedTransactionId: null,
    importId: null,
    deleted: false
  },
  {
    id: "transaction-2",
    date: "2026-04-06",
    amount: -25_000,
    memo: null,
    cleared: "cleared",
    approved: true,
    flagColor: null,
    accountId: "account-1",
    accountName: "Checking",
    payeeId: null,
    payeeName: "Mystery charge",
    categoryId: null,
    categoryName: null,
    transferAccountId: null,
    transferTransactionId: null,
    matchedTransactionId: null,
    importId: null,
    deleted: false
  },
  {
    id: "transaction-3",
    date: "2026-04-01",
    amount: -100_000,
    memo: null,
    cleared: "cleared",
    approved: true,
    flagColor: null,
    accountId: "account-1",
    accountName: "Checking",
    payeeId: "payee-2",
    payeeName: "Landlord",
    categoryId: "category-2",
    categoryName: "Rent",
    transferAccountId: null,
    transferTransactionId: null,
    matchedTransactionId: null,
    importId: null,
    deleted: false
  }
];

type MockClient = ReadonlyYnabApi;

const mockClient: MockClient = {
  listBudgets: () => Promise.resolve(budgets),
  listAccounts: () => Promise.resolve(accounts),
  listCategories: () => Promise.resolve(categories),
  listTransactions: () => Promise.resolve(transactions)
};

describe("YNAB tools", () => {
  it("lists budgets", async () => {
    await expect(listBudgets(mockClient)).resolves.toEqual(budgets);
  });

  it("lists accounts", async () => {
    await expect(listAccounts(mockClient, { budgetId: "budget-1" })).resolves.toEqual(accounts);
  });

  it("lists categories", async () => {
    await expect(listCategories(mockClient, { budgetId: "budget-1" })).resolves.toEqual(categories);
  });

  it("lists recent transactions", async () => {
    const result = await listRecentTransactions(mockClient, { budgetId: "budget-1", days: 30 });
    expect(result).toHaveLength(3);
  });

  it("finds uncategorized transactions", async () => {
    const result = await findUncategorizedTransactions(mockClient, { budgetId: "budget-1", days: 30 });
    expect(result).toEqual([
      {
        ...transactions[1],
        reason: "missing_category"
      }
    ]);
  });

  it("aggregates monthly spend by category", async () => {
    const result = await monthlySpendByCategory(mockClient, { budgetId: "budget-1", month: "2026-04" });
    expect(result).toEqual([
      {
        month: "2026-04",
        categoryId: "category-2",
        categoryName: "Rent",
        categoryGroupName: "Living",
        transactionCount: 1,
        totalOutflow: 100_000
      },
      {
        month: "2026-04",
        categoryId: "category-1",
        categoryName: "Groceries",
        categoryGroupName: "Living",
        transactionCount: 1,
        totalOutflow: 12_500
      }
    ]);
  });

  it("builds explicit tool definitions with schemas", async () => {
    const tools = buildReadonlyToolDefinitions(mockClient);
    const listBudgetsTool = tools.find((tool) => tool.name === "listBudgets");

    expect(tools).toHaveLength(6);
    expect(listBudgetsTool?.description).toContain("List all YNAB budgets");
    await expect(listBudgetsTool?.execute({})).resolves.toEqual(budgets);
  });
});
