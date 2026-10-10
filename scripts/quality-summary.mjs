// Turns Playwright's JSON report into a small, public summary that the /quality page displays.
// Usage: node scripts/quality-summary.mjs [output path]   (default: dist/quality/results.json)
import fs from 'node:fs';
import path from 'node:path';

const input = 'test-results/results.json';
const output = process.argv[2] ?? 'dist/quality/results.json';

const GROUP_NAMES = {
  'pages.spec.ts': 'Pages',
  'navigation.spec.ts': 'Navigation & links',
  'contact.spec.ts': 'Contact form',
  'accessibility.spec.ts': 'Accessibility',
  'site-health.spec.ts': 'Site health',
  'quality.spec.ts': 'Quality page',
  'test-ids.spec.ts': 'Test ID contract',
};

const report = JSON.parse(fs.readFileSync(input, 'utf8'));
const groups = new Map();

function walk(suite, file, trail) {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      const status =
        t.status === 'expected' ? 'passed' : t.status === 'unexpected' ? 'failed' : t.status; // flaky | skipped
      const last = t.results?.at(-1);
      const name = GROUP_NAMES[file] ?? file;
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push({
        title: [...trail, spec.title].join(' › '),
        project: t.projectName,
        status,
        durationMs: last?.duration ?? 0,
      });
    }
  }
  for (const child of suite.suites ?? []) walk(child, file, [...trail, child.title]);
}

for (const fileSuite of report.suites ?? []) {
  const file = path.basename(fileSuite.file ?? fileSuite.title);
  walk(fileSuite, file, []);
}

const all = [...groups.values()].flat();
const count = (s) => all.filter((t) => t.status === s).length;

const { GITHUB_SHA, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
const repoUrl = GITHUB_REPOSITORY ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}` : undefined;

const summary = {
  generatedAt: new Date().toISOString(),
  commit: GITHUB_SHA,
  commitUrl: repoUrl && GITHUB_SHA ? `${repoUrl}/commit/${GITHUB_SHA}` : undefined,
  runUrl: repoUrl && GITHUB_RUN_ID ? `${repoUrl}/actions/runs/${GITHUB_RUN_ID}` : undefined,
  stats: {
    total: all.length,
    passed: count('passed') + count('flaky'),
    failed: count('failed') + count('timedOut') + count('interrupted'),
    flaky: count('flaky'),
    skipped: count('skipped'),
    durationMs: Math.round(report.stats?.duration ?? 0),
  },
  groups: [...groups].map(([name, tests]) => ({ name, tests })),
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(summary, null, 2));
console.log(
  `Wrote ${output}: ${summary.stats.passed}/${summary.stats.total - summary.stats.skipped} passed, ` +
    `${summary.stats.failed} failed, ${summary.stats.skipped} skipped`
);
