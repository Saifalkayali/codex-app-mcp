import { z } from "zod";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD date");
const isoMonthSchema = z.string().regex(/^\d{4}-\d{2}$/, "Expected YYYY-MM month");

export const budgetIdInputSchema = z
  .object({
    budgetId: z.string().min(1)
  })
  .strict();

export const budgetWithDaysInputSchema = budgetIdInputSchema
  .extend({
    days: z.number().int().min(1).max(365).default(30)
  })
  .strict();

export const monthlySpendInputSchema = budgetIdInputSchema
  .extend({
    month: isoMonthSchema
  })
  .strict();

export const ynabBudgetSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    lastModifiedOn: z.string().datetime().nullable(),
    firstMonth: isoDateSchema.nullable(),
    lastMonth: isoDateSchema.nullable(),
    dateFormat: z.string().nullable(),
    currencyFormat: z.string().nullable()
  })
  .strict();

export const ynabAccountSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    type: z.string().min(1),
    onBudget: z.boolean(),
    closed: z.boolean(),
    note: z.string().nullable(),
    balance: z.number().int(),
    clearedBalance: z.number().int(),
    unclearedBalance: z.number().int(),
    transferPayeeId: z.string().nullable(),
    deleted: z.boolean()
  })
  .strict();

export const ynabCategorySchema = z
  .object({
    id: z.string().min(1),
    categoryGroupId: z.string().min(1),
    categoryGroupName: z.string().min(1),
    name: z.string().min(1),
    hidden: z.boolean(),
    originalCategoryGroupId: z.string().nullable(),
    note: z.string().nullable(),
    budgeted: z.number().int(),
    activity: z.number().int(),
    balance: z.number().int(),
    deleted: z.boolean()
  })
  .strict();

export const ynabTransactionSchema = z
  .object({
    id: z.string().min(1),
    date: isoDateSchema,
    amount: z.number().int(),
    memo: z.string().nullable(),
    cleared: z.string().min(1),
    approved: z.boolean(),
    flagColor: z.string().nullable(),
    accountId: z.string().min(1),
    accountName: z.string().min(1),
    payeeId: z.string().nullable(),
    payeeName: z.string().nullable(),
    categoryId: z.string().nullable(),
    categoryName: z.string().nullable(),
    transferAccountId: z.string().nullable(),
    transferTransactionId: z.string().nullable(),
    matchedTransactionId: z.string().nullable(),
    importId: z.string().nullable(),
    deleted: z.boolean()
  })
  .strict();

export const uncategorizedTransactionSchema = ynabTransactionSchema
  .extend({
    reason: z.literal("missing_category")
  })
  .strict();

export const monthlyCategorySpendSchema = z
  .object({
    month: isoMonthSchema,
    categoryId: z.string().min(1),
    categoryName: z.string().min(1),
    categoryGroupName: z.string().min(1),
    transactionCount: z.number().int().min(0),
    totalOutflow: z.number().int().min(0)
  })
  .strict();

export const listBudgetsOutputSchema = z.array(ynabBudgetSchema);
export const listAccountsOutputSchema = z.array(ynabAccountSchema);
export const listCategoriesOutputSchema = z.array(ynabCategorySchema);
export const listRecentTransactionsOutputSchema = z.array(ynabTransactionSchema);
export const findUncategorizedTransactionsOutputSchema = z.array(uncategorizedTransactionSchema);
export const monthlySpendByCategoryOutputSchema = z.array(monthlyCategorySpendSchema);

export type BudgetIdInput = z.infer<typeof budgetIdInputSchema>;
export type BudgetWithDaysInput = z.infer<typeof budgetWithDaysInputSchema>;
export type MonthlySpendInput = z.infer<typeof monthlySpendInputSchema>;
