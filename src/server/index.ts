import { YnabClient } from "../clients/ynab-client.js";
import { buildReadonlyToolDefinitions } from "./tool-definitions.js";
import type { ReadonlyYnabServer } from "../types/server.js";

export function createReadonlyYnabServer(client: YnabClient = YnabClient.fromEnv()): ReadonlyYnabServer {
  return {
    name: "ynab-readonly-mcp-server",
    version: "0.1.0",
    tools: buildReadonlyToolDefinitions(client)
  };
}

function main(): void {
  const server = createReadonlyYnabServer();

  // TODO: Connect MCP transport wiring here.
  // TODO: Register each tool definition, including names, descriptions, and Zod schemas, with your MCP SDK here.
  console.log(`Prepared ${server.name} with ${server.tools.length} read-only tools.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
