import type { ZodType } from "zod";

export interface ReadonlyToolDefinition {
  name: string;
  description: string;
  inputSchema: ZodType;
  outputSchema: ZodType;
  execute: (input: unknown) => Promise<unknown>;
}

export interface ReadonlyYnabServer {
  name: string;
  version: string;
  tools: ReadonlyToolDefinition[];
}
