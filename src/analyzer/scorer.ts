import { RepoMetadata, Tool, ConnectionResult, ScoreResult, ScoreBreakdown } from '../types';

/**
 * Score an MCP server based on quality signals.
 * Unmeasured criteria (e.g. when the probe couldn't connect) are excluded
 * from the denominator so the displayed total reflects what was actually checked.
 */
export function scoreServer(
  repo: RepoMetadata,
  tools: Tool[],
  connection: ConnectionResult
): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];
  const probeSkipped = !connection.connected;
  const noTools = tools.length === 0;

  // 1. Responds under 3s → 20pts (only if we connected)
  const respondsFast = connection.connected && connection.latencyMs < 3000;
  breakdown.push({
    label: 'Responds under 3s',
    key: 'responds_under_3s',
    maxPoints: 20,
    earnedPoints: respondsFast ? 20 : 0,
    passed: respondsFast,
    unmeasured: probeSkipped,
  });

  // 2. All tools have descriptions → 20pts (needs tools)
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
    unmeasured: probeSkipped && noTools,
  });

  // 3. All inputs typed → 15pts (needs tools)
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
    unmeasured: probeSkipped && allInputs.length === 0,
  });

  // 4. No hardcoded secrets → 20pts (static, always measurable)
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

  // 5. README with install guide → 15pts (static, always measurable)
  const hasReadme = repo.readmeContent.length > 200;
  const hasInstallGuide =
    hasReadme &&
    (repo.readmeContent.toLowerCase().includes('install') ||
      repo.readmeContent.toLowerCase().includes('getting started') ||
      repo.readmeContent.toLowerCase().includes('usage') ||
      repo.readmeContent.toLowerCase().includes('npm') ||
      repo.readmeContent.toLowerCase().includes('npx'));
  const readmePoints = hasInstallGuide ? 15 : hasReadme ? 10 : 0;
  breakdown.push({
    label: 'README with install guide',
    key: 'has_readme',
    maxPoints: 15,
    earnedPoints: readmePoints,
    passed: hasInstallGuide,
  });

  // 6. Error schemas → 10pts (needs tools)
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
    unmeasured: probeSkipped && noTools,
  });

  const measured = breakdown.filter((b) => !b.unmeasured);
  const total = measured.reduce((sum, b) => sum + b.earnedPoints, 0);
  const maxTotal = measured.reduce((sum, b) => sum + b.maxPoints, 0);

  // Grade by percentage of measured points
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  let grade: 'A' | 'B' | 'C' | 'F';
  if (pct >= 80) grade = 'A';
  else if (pct >= 60) grade = 'B';
  else if (pct >= 40) grade = 'C';
  else grade = 'F';

  return { total, maxTotal, grade, breakdown };
}
