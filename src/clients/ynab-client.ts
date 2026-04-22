import { YnabApiError, YnabConfigError } from "../types/errors.js";
import type { YnabAccount, YnabBudget, YnabCategory, YnabTransaction } from "../types/ynab.js";

const DEFAULT_BASE_URL = "https://api.ynab.com/v1";
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 3;

interface YnabClientOptions {
  token: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  fetchImpl?: typeof fetch;
}

interface YnabEnvelope<T> {
  data: T;
}

interface YnabBudgetDto {
  id: string;
  name: string;
  last_modified_on: string | null;
  first_month: string | null;
  last_month: string | null;
  date_format: { format: string } | null;
  currency_format: { iso_code: string } | null;
}

interface YnabAccountDto {
  id: string;
  name: string;
  type: string;
  on_budget: boolean;
  closed: boolean;
  note: string | null;
  balance: number;
  cleared_balance: number;
  uncleared_balance: number;
  transfer_payee_id: string | null;
  deleted: boolean;
}

interface YnabCategoryDto {
  id: string;
  category_group_id: string;
  category_group_name: string;
  name: string;
  hidden: boolean;
  original_category_group_id: string | null;
  note: string | null;
  budgeted: number;
  activity: number;
  balance: number;
  deleted: boolean;
}

interface YnabTransactionDto {
  id: string;
  date: string;
  amount: number;
  memo: string | null;
  cleared: string;
  approved: boolean;
  flag_color: string | null;
  account_id: string;
  account_name: string;
  payee_id: string | null;
  payee_name: string | null;
  category_id: string | null;
  category_name: string | null;
  transfer_account_id: string | null;
  transfer_transaction_id: string | null;
  matched_transaction_id: string | null;
  import_id: string | null;
  deleted: boolean;
}

export class YnabClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly fetchImpl: typeof fetch;

  public constructor(options: YnabClientOptions) {
    this.token = options.token;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  public static fromEnv(env: NodeJS.ProcessEnv = process.env): YnabClient {
    const token = env.YNAB_TOKEN;

    if (!token) {
      throw new YnabConfigError("Missing YNAB_TOKEN environment variable.");
    }

    return new YnabClient({
      token,
      baseUrl: env.YNAB_API_BASE_URL,
      timeoutMs: env.YNAB_TIMEOUT_MS ? Number(env.YNAB_TIMEOUT_MS) : undefined
    });
  }

  public async listBudgets(): Promise<YnabBudget[]> {
    const response = await this.request<{ budgets: YnabBudgetDto[] }>("/budgets");
    return response.budgets.map(mapBudget);
  }

  public async listAccounts(budgetId: string): Promise<YnabAccount[]> {
    const response = await this.request<{ accounts: YnabAccountDto[] }>(`/budgets/${budgetId}/accounts`);
    return response.accounts.map(mapAccount);
  }

  public async listCategories(budgetId: string): Promise<YnabCategory[]> {
    const response = await this.request<{ category_groups: Array<{ name: string; categories: YnabCategoryDto[] }> }>(
      `/budgets/${budgetId}/categories`
    );

    return response.category_groups.flatMap((group) =>
      group.categories.map((category) =>
        mapCategory({
          ...category,
          category_group_name: group.name
        })
      )
    );
  }

  public async listTransactions(budgetId: string, sinceDate?: string): Promise<YnabTransaction[]> {
    const search = new URLSearchParams();

    if (sinceDate) {
      search.set("since_date", sinceDate);
    }

    const path = `/budgets/${budgetId}/transactions${search.size > 0 ? `?${search.toString()}` : ""}`;
    const response = await this.request<{ transactions: YnabTransactionDto[] }>(path);
    return response.transactions.map(mapTransaction);
  }

  private async request<T>(path: string): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/json"
          },
          signal: controller.signal
        });

        if (!response.ok) {
          const requestId = response.headers.get("X-Request-Id") ?? undefined;
          const retryAfterSeconds = getRetryAfterSeconds(response.headers.get("Retry-After"));
          const retryable = response.status === 429 || response.status >= 500;

          if (retryable && attempt < this.maxRetries) {
            await sleep(retryAfterSeconds ?? backoffMs(attempt));
            continue;
          }

          const bodyText = await response.text();
          throw new YnabApiError(`YNAB API request failed with status ${response.status}: ${bodyText || "unknown error"}`, {
            status: response.status,
            requestId,
            retryable
          });
        }

        const json = (await response.json()) as YnabEnvelope<T>;
        return json.data;
      } catch (error) {
        if (error instanceof YnabApiError) {
          throw error;
        }

        const retryable = isRetryableNetworkError(error);

        if (!retryable || attempt >= this.maxRetries) {
          throw new YnabApiError(`YNAB API request failed: ${error instanceof Error ? error.message : "unknown error"}`, {
            status: 0,
            retryable
          });
        }

        await sleep(backoffMs(attempt));
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new YnabApiError("YNAB API request failed after retries.", {
      status: 0,
      retryable: true
    });
  }
}

function mapBudget(budget: YnabBudgetDto): YnabBudget {
  return {
    id: budget.id,
    name: budget.name,
    lastModifiedOn: budget.last_modified_on,
    firstMonth: budget.first_month,
    lastMonth: budget.last_month,
    dateFormat: budget.date_format?.format ?? null,
    currencyFormat: budget.currency_format?.iso_code ?? null
  };
}

function mapAccount(account: YnabAccountDto): YnabAccount {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    onBudget: account.on_budget,
    closed: account.closed,
    note: account.note,
    balance: account.balance,
    clearedBalance: account.cleared_balance,
    unclearedBalance: account.uncleared_balance,
    transferPayeeId: account.transfer_payee_id,
    deleted: account.deleted
  };
}

function mapCategory(category: YnabCategoryDto): YnabCategory {
  return {
    id: category.id,
    categoryGroupId: category.category_group_id,
    categoryGroupName: category.category_group_name,
    name: category.name,
    hidden: category.hidden,
    originalCategoryGroupId: category.original_category_group_id,
    note: category.note,
    budgeted: category.budgeted,
    activity: category.activity,
    balance: category.balance,
    deleted: category.deleted
  };
}

function mapTransaction(transaction: YnabTransactionDto): YnabTransaction {
  return {
    id: transaction.id,
    date: transaction.date,
    amount: transaction.amount,
    memo: transaction.memo,
    cleared: transaction.cleared,
    approved: transaction.approved,
    flagColor: transaction.flag_color,
    accountId: transaction.account_id,
    accountName: transaction.account_name,
    payeeId: transaction.payee_id,
    payeeName: transaction.payee_name,
    categoryId: transaction.category_id,
    categoryName: transaction.category_name,
    transferAccountId: transaction.transfer_account_id,
    transferTransactionId: transaction.transfer_transaction_id,
    matchedTransactionId: transaction.matched_transaction_id,
    importId: transaction.import_id,
    deleted: transaction.deleted
  };
}

function getRetryAfterSeconds(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const seconds = Number(value);
  return Number.isFinite(seconds) ? seconds * 1_000 : null;
}

function backoffMs(attempt: number): number {
  return Math.min(2 ** attempt * 500, 4_000);
}

function isRetryableNetworkError(error: unknown): boolean {
  return error instanceof Error;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
