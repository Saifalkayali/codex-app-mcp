# YNAB Read-Only MCP Server Starter

Production-style TypeScript starter for building a read-only MCP server on top of the YNAB API.

## Features

- Node.js 18+ with strict TypeScript
- Modular structure under `src/server`, `src/tools`, `src/clients`, `src/schemas`, and `src/types`
- Read-only YNAB API access with environment-based auth
- Zod validation for tool inputs and outputs
- Retry-aware HTTP client for rate limits and transient failures
- Unit tests with mocked YNAB responses
- Clear TODO markers for MCP transport wiring

## Project Structure

```text
src/
  clients/     YNAB API client and retry logic
  server/      MCP server assembly and tool definitions
  schemas/     Zod schemas for inputs and outputs
  tools/       Read-only tool implementations
  types/       Shared TypeScript types and error classes
test/          Unit tests with mocked responses
```

## Tools Included

- `listBudgets`
- `listAccounts`
- `listCategories`
- `listRecentTransactions`
- `findUncategorizedTransactions`
- `monthlySpendByCategory`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and add your YNAB personal access token:

   ```bash
   cp .env.example .env
   ```

3. Start local development:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run build` compiles the server into `dist/`
- `npm run dev` runs the starter in watch mode
- `npm run lint` checks code quality with ESLint
- `npm run test` runs unit tests with Vitest
- `npm run typecheck` runs the TypeScript compiler without emitting files
- `npm run check` runs lint, typecheck, and tests together

## Security Notes

- This starter only performs `GET` requests against the YNAB API.
- Do not commit `.env` or your `YNAB_TOKEN`.
- Treat the token like production credentials. Use a separate token for development if possible.
- Error messages avoid logging request headers, but you should still keep production logs scrubbed of secrets.
- If you add more MCP tools later, preserve the read-only boundary unless you intentionally design a write flow.

## MCP Wiring

The starter intentionally stops short of picking an MCP SDK or transport. See `src/server/index.ts` for the server assembly point and `src/server/tool-definitions.ts` for the place where input/output schemas are already paired with each tool.

## Extending the Starter

- Wire the objects returned by `buildReadonlyToolDefinitions()` into your MCP SDK registration layer.
- Keep all YNAB writes disabled unless you intentionally design and review a separate write-capable client.
- Prefer adding new tools as small modules under `src/tools/` with matching Zod schemas in `src/schemas/`.

## Example Prompts

- "List my YNAB budgets."
- "Show me the accounts in budget `budget-id`."
- "List categories for budget `budget-id`."
- "Show recent transactions from the last 14 days for budget `budget-id`."
- "Find uncategorized transactions in budget `budget-id` from the last 30 days."
- "Summarize monthly spend by category for budget `budget-id` in `2026-04`."

## Notes on Amounts

YNAB returns amounts in milliunits. For example, `12340` means `12.34` in the budget currency. This starter preserves the raw values so MCP consumers can choose their own formatting rules.
