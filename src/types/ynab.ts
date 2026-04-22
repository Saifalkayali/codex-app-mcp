export interface YnabBudget {
  id: string;
  name: string;
  lastModifiedOn: string | null;
  firstMonth: string | null;
  lastMonth: string | null;
  dateFormat: string | null;
  currencyFormat: string | null;
}

export interface YnabAccount {
  id: string;
  name: string;
  type: string;
  onBudget: boolean;
  closed: boolean;
  note: string | null;
  balance: number;
  clearedBalance: number;
  unclearedBalance: number;
  transferPayeeId: string | null;
  deleted: boolean;
}

export interface YnabCategory {
  id: string;
  categoryGroupId: string;
  categoryGroupName: string;
  name: string;
  hidden: boolean;
  originalCategoryGroupId: string | null;
  note: string | null;
  budgeted: number;
  activity: number;
  balance: number;
  deleted: boolean;
}

export interface YnabTransaction {
  id: string;
  date: string;
  amount: number;
  memo: string | null;
  cleared: string;
  approved: boolean;
  flagColor: string | null;
  accountId: string;
  accountName: string;
  payeeId: string | null;
  payeeName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  transferAccountId: string | null;
  transferTransactionId: string | null;
  matchedTransactionId: string | null;
  importId: string | null;
  deleted: boolean;
}

export interface UncategorizedTransaction extends YnabTransaction {
  reason: "missing_category";
}

export interface MonthlyCategorySpend {
  month: string;
  categoryId: string;
  categoryName: string;
  categoryGroupName: string;
  transactionCount: number;
  totalOutflow: number;
}
