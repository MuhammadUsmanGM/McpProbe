import { RepoMetadata, Tool, ConnectionResult, ScoreResult, ScoreBreakdown } from '../types';

/**
 * Score an MCP server out of 100 based on quality signals.
 */
export function scoreServer(
  repo: RepoMetadata,
  tools: Tool[],
  connection: ConnectionResult
): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];

  // 1. Responds under 3s → 20pts
  const respondsFast = connection.connected && connection.latencyMs < 3000;
  breakdown.push({
    label: 'Responds under 3s',
    key: 'responds_under_3s',
    maxPoints: 20,
    earnedPoints: respondsFast ? 20 : 0,
    passed: respondsFast,
  });

  // 2. All tools have descriptions → 20pts
  const allDescribed = tools.length > 0 && tools.every((t) => !!t.description);
  const descCount = tools.filter((t) => !!t.description).length;
  const descRatio = tools.length > 0 ? descCount / tools.length : 0;
  const descPoints = tools.length === 0 ? 0 : Math.round(descRatio * 20);
  breakdown.push({
    label: 'All tools have descriptions',
    key: 'tools_described',
    maxPoints: 20,
    earnedPoints: descPoints,
    passed: allDescribed,
  });

  // 3. All inputs typed → 15pts
  const allInputs = tools.flatMap((t) => t.inputs);
  const typedInputs = allInputs.filter((i) => i.type && i.type !== 'unknown');
  const allTyped = allInputs.length > 0 && typedInputs.length === allInputs.length;
  const typedRatio = allInputs.length > 0 ? typedInputs.length / allInputs.length : 0;
  const typedPoints = allInputs.length === 0 ? 0 : Math.round(typedRatio * 15);
  breakdown.push({
    label: 'All inputs typed',
    key: 'inputs_typed',
    maxPoints: 15,
    earnedPoints: typedPoints,
    passed: allTyped,
  });

  // 4. No hardcoded secrets → 20pts
  const secretPatterns = [
    /sk-[a-zA-Z0-9]{20,}/,
    /ghp_[a-zA-Z0-9]{36}/,
    /AKIA[A-Z0-9]{16}/,
    /api[_-]?key\s*[:=]\s*["'][^"']{10,}["']/i,
    /secret\s*[:=]\s*["'][^"']{10,}["']/i,
    /password\s*[:=]\s*["'][^"']{5,}["']/i,
  ];

  const readmeHasSecrets = secretPatterns.some((p) => p.test(repo.readmeContent));
  const noSecrets = !readmeHasSecrets;
  breakdown.push({
    label: 'No hardcoded secrets',
    key: 'no_secrets',
    maxPoints: 20,
    earnedPoints: noSecrets ? 20 : 0,
    passed: noSecrets,
  });

  // 5. README with install guide → 15pts
  const hasReadme = repo.readmeContent.length > 200;
  const hasInstallGuide = hasReadme && (
    repo.readmeContent.toLowerCase().includes('install') ||
    repo.readmeContent.toLowerCase().includes('getting started') ||
    repo.readmeContent.toLowerCase().includes('usage') ||
    repo.readmeContent.toLowerCase().includes('npm') ||
    repo.readmeContent.toLowerCase().includes('npx')
  );
  const readmePoints = hasInstallGuide ? 15 : hasReadme ? 10 : 0;
  breakdown.push({
    label: 'README with install guide',
    key: 'has_readme',
    maxPoints: 15,
    earnedPoints: readmePoints,
    passed: hasInstallGuide,
  });

  // 6. Error handling / error schemas → 10pts
  const hasErrorHandling = tools.some((t) => {
    if (!t.inputSchema) return false;
    const schemaStr = JSON.stringify(t.inputSchema);
    return schemaStr.includes('error') || schemaStr.includes('Error');
  });
  breakdown.push({
    label: 'Has error schemas',
    key: 'has_error_handling',
    maxPoints: 10,
    earnedPoints: hasErrorHandling ? 10 : 0,
    passed: hasErrorHandling,
  });

  const total = breakdown.reduce((sum, b) => sum + b.earnedPoints, 0);
  const maxTotal = breakdown.reduce((sum, b) => sum + b.maxPoints, 0);

  let grade: 'A' | 'B' | 'C' | 'F';
  if (total >= 80) grade = 'A';
  else if (total >= 60) grade = 'B';
  else if (total >= 40) grade = 'C';
  else grade = 'F';

  return { total, maxTotal, grade, breakdown };
}
