export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  defaultBranch: string;
  url: string;
  packageJson: PackageJsonData | null;
  readmeContent: string;
  isLocal: boolean;
  localPath?: string;
}

export interface PackageJsonData {
  name: string;
  version?: string;
  description?: string;
  main?: string;
  bin?: Record<string, string> | string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export type ServerTransport = 'stdio' | 'http' | 'unknown';

export interface ToolInput {
  name: string;
  type: string;
  description?: string;
  required: boolean;
}

export interface Tool {
  name: string;
  description?: string;
  inputSchema?: Record<string, any>;
  inputs: ToolInput[];
}

export interface ConnectionResult {
  tools: Tool[];
  latencyMs: number;
  connected: boolean;
  error?: string;
}

export type CompatStatus = 'ready' | 'warning' | 'error';

export interface CompatEntry {
  client: string;
  status: CompatStatus;
  message: string;
}

export interface ScoreBreakdown {
  label: string;
  key: string;
  maxPoints: number;
  earnedPoints: number;
  passed: boolean;
}

export interface ScoreResult {
  total: number;
  maxTotal: number;
  grade: 'A' | 'B' | 'C' | 'F';
  breakdown: ScoreBreakdown[];
}

export interface ProbeResult {
  repo: RepoMetadata;
  transport: ServerTransport;
  connection: ConnectionResult;
  tools: Tool[];
  compatibility: CompatEntry[];
  score: ScoreResult;
  configs: Record<string, string>;
  probedAt: string;
}

export interface CLIOptions {
  json?: boolean;
  md?: boolean;
  tools?: boolean;
  score?: boolean;
  config?: string;
  copy?: boolean;
  yes?: boolean;
}
