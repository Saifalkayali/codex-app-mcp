import { YnabClient } from "../clients/ynab-client.js";
import {
  findUncategorizedTransactions,
  listAccounts,
  listBudgets,
  listCategories,
  listRecentTransactions,
  monthlySpendByCategory
} from "../tools/index.js";

export function createReadonlyYnabServer(client: YnabClient = YnabClient.fromEnv()) {
  return {
    name: "ynab-readonly-mcp-server",
    version: "0.1.0",
    tools: {
      listBudgets: async () => listBudgets(client),
      listAccounts: async (input: unknown) => listAccounts(client, input),
      listCategories: async (input: unknown) => listCategories(client, input),
      listRecentTransactions: async (input: unknown) => listRecentTransactions(client, input),
      findUncategorizedTransactions: async (input: unknown) => findUncategorizedTransactions(client, input),
      monthlySpendByCategory: async (input: unknown) => monthlySpendByCategory(client, input)
    }
  };
}

async function main(): Promise<void> {
  const server = createReadonlyYnabServer();

  // TODO: Connect MCP transport wiring here.
  // TODO: Register tool metadata and schemas with your MCP SDK of choice here.
  console.log(`Prepared ${server.name} with ${Object.keys(server.tools).length} read-only tools.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
