import { Tool, ToolInput } from '../types';

/**
 * Parse raw MCP tools response into structured Tool objects.
 */
export function parseTools(rawTools: any[]): Tool[] {
  if (!Array.isArray(rawTools)) {
    return [];
  }

  return rawTools.map((raw) => parseSingleTool(raw)).filter(Boolean) as Tool[];
}

function parseSingleTool(raw: any): Tool | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const name = raw.name;
  if (typeof name !== 'string' || !name) {
    return null;
  }

  const description = typeof raw.description === 'string' ? raw.description : undefined;
  const inputSchema = raw.inputSchema || raw.input_schema || null;
  const inputs = parseInputSchema(inputSchema);

  return {
    name,
    description,
    inputSchema,
    inputs,
  };
}

function parseInputSchema(schema: any): ToolInput[] {
  if (!schema || typeof schema !== 'object') {
    return [];
  }

  const properties = schema.properties || {};
  const required = new Set<string>(Array.isArray(schema.required) ? schema.required : []);

  return Object.entries(properties).map(([name, prop]: [string, any]) => ({
    name,
    type: prop?.type || 'unknown',
    description: prop?.description,
    required: required.has(name),
  }));
}
