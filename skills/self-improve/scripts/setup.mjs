#!/usr/bin/env node
/**
 * Self-Improve setup script.
 *
 * Usage:
 *   node scripts/setup.mjs                          # uses user-config.yaml
 *   node scripts/setup.mjs --config my-config.yaml  # custom config
 *   node scripts/setup.mjs --dry-run                # report what would be done
 *   node scripts/setup.mjs --help
 *
 * Behavior:
 *   1. Loads and validates user-config.yaml.
 *   2. Resolves storage paths.
 *   3. Creates the full directory tree.
 *   4. Initializes empty data files (hot.md, corrections.md, etc.).
 *   5. Writes a Cron proposal to proposals/PENDING.md.
 *   6. Updates config.yaml storage block with resolved paths.
 *
 * Safe to re-run: existing files are not overwritten.
 */

import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Tiny YAML parser ──────────────────────────────────────────────
//
// Avoids a yaml dependency. Supports the subset of YAML used by
// user-config.yaml: 2-space indentation, top-level scalars, one level
// of nested mappings, and `[]` / inline-list values.
//
// Not a general YAML parser. If user-config.yaml grows beyond this
// grammar, swap in the `yaml` package.

function parseSimpleYaml(text) {
  const lines = text.split('\n');
  const root = {};
  const stack = [{ indent: -1, obj: root }];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');
    if (!line || line.trim().startsWith('#')) continue;

    const indent = line.match(/^ */)[0].length;
    const trimmed = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;

    if (trimmed.endsWith(':')) {
      const key = trimmed.slice(0, -1);
      const child = {};
      parent[key] = child;
      stack.push({ indent, obj: child });
    } else if (trimmed.includes(':')) {
      const idx = trimmed.indexOf(':');
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      parent[key] = unquote(value);
    }
  }

  return root;
}

function unquote(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~' || v === '') return null;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v.replace(/^["']|["']$/g, '');
}

// ─── CLI ───────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SOURCE_DIR = join(__dirname, '..');

const argv = process.argv.slice(2);
let configPath = 'user-config.yaml';
let dryRun = false;

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--config' && argv[i + 1]) {
    configPath = argv[i + 1];
    i++;
  } else if (a === '--dry-run') {
    dryRun = true;
  } else if (a === '--help' || a === '-h') {
    printHelp();
    process.exit(0);
  }
}

function printHelp() {
  console.log(`Self-Improve setup

Usage:
  node scripts/setup.mjs [--config <file>] [--dry-run] [--help]

Options:
  --config <file>   Config file to load (default: user-config.yaml)
  --dry-run         Report what would be created; do not modify anything
  --help, -h        Show this help

Examples:
  node scripts/setup.mjs
  node scripts/setup.mjs --config my-config.yaml
  node scripts/setup.mjs --dry-run`);
}

// ─── 1. Load config ────────────────────────────────────────────────

let userConfig = {};
// configPath may be relative (resolved against SOURCE_DIR) or absolute.
const fullConfigPath = configPath.startsWith('/')
  ? configPath
  : join(SOURCE_DIR, configPath);

if (existsSync(fullConfigPath)) {
  try {
    const content = readFileSync(fullConfigPath, 'utf-8');
    userConfig = parseSimpleYaml(content);
    console.log(`[setup] loaded config: ${configPath}`);
  } catch (err) {
    console.error(`[setup] failed to parse ${configPath}: ${err.message}`);
    process.exit(1);
  }
} else {
  console.log(`[setup] config not found at ${configPath}; using defaults`);
}

// ─── 2. Validate ───────────────────────────────────────────────────

const errors = [];

const storage = userConfig.storage ?? {};
const root = storage.root || SOURCE_DIR;
const knowledgeRoot = storage.knowledge_root || join(root, 'knowledge');
const workspaceRoot = storage.workspace_root || '';

if (!root) errors.push('storage.root is required');
if (!knowledgeRoot) errors.push('storage.knowledge_root is required');

const owner = userConfig.owner ?? {};
const ownerName = owner.name || 'Owner';
const ownerTz = owner.timezone || 'UTC';

const agent = userConfig.agent ?? {};
const mainAgent = agent.main_agent || 'main';
const cronModel = agent.cron_model || 'omniroute/T2';

const schedule = userConfig.schedule ?? {};
const cronExpr = schedule.cron || '0 4 */3 * *';

if (errors.length) {
  console.error('[setup] validation failed:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`[setup] target: ${root}`);
console.log(`[setup] knowledge: ${knowledgeRoot}`);
console.log(`[setup] workspace: ${workspaceRoot || '(not set)'}`);
console.log(`[setup] timezone: ${ownerTz}`);
console.log(`[setup] cron: ${cronExpr}`);
console.log(`[setup] model: ${cronModel}`);

if (dryRun) {
  console.log('[setup] --dry-run; exiting without changes');
  process.exit(0);
}

// ─── 3. Create directories ─────────────────────────────────────────

const dirs = [
  '',
  'data',
  'data/feedback',
  'data/skills',
  'data/themes',
  'data/themes/behavior',
  'data/themes/communication',
  'data/themes/tools',
  'data/themes/coding',
  'data/themes/search',
  'data/themes/writing',
  'data/themes/collaboration',
  'data/themes/preferences',
  'data/themes/professional',
  'data/themes/personality',
  'data/themes/devops',
  'data/domains',
  'data/projects',
  'data/jobs',
  'data/archive',
  'data/backup',
  'data/high-value',
  'data/errors',
  'data/lessons',
  'proposals',
  'drafts',
];

let created = 0;
for (const d of dirs) {
  const full = join(root, d);
  if (!existsSync(full)) {
    mkdirSync(full, { recursive: true });
    created++;
  }
}
console.log(`[setup] directories ensured (${created} new)`);

// ─── 4. Initialize data files ──────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

const dataFiles = {
  'data/hot.md': `# HOT layer — active rules\n\n> ≤100 lines; loaded into every context.\n> Last updated: ${today}\n\n## Confirmed preferences\n\n(none yet)\n\n## Active rules\n\n(none yet)\n`,
  'data/corrections.md': `# Corrections log\n\n> Most recent 50 entries; older entries rotate to data/archive/.\n\n(none yet)\n`,
  'data/reflections.md': `# Self-reflection log\n\n> Appended after every important task completion.\n\n(none yet)\n`,
  'data/profile.md': `# Team capability profile\n\n> Updated every 3rd run by the profiler module.\n> Last updated: pending first run.\n\nInsufficient data; will populate after the first scheduled run.\n`,
  'data/notification-log.jsonl': '',
  'run-log.jsonl': '',
  'checkpoint.json': JSON.stringify(
    {
      run_id: null,
      current_step: null,
      status: 'idle',
      completed_steps: [],
      pending_steps: [],
      high_value_items: [],
      last_update: null,
    },
    null,
    2
  ) + '\n',
};

let initCount = 0;
for (const [file, content] of Object.entries(dataFiles)) {
  const full = join(root, file);
  if (!existsSync(full)) {
    writeFileSync(full, content, 'utf-8');
    initCount++;
  }
}
console.log(`[setup] data files initialized (${initCount} new)`);

// Per-theme index
const themes = [
  'behavior', 'communication', 'tools', 'coding', 'search',
  'writing', 'collaboration', 'preferences', 'professional',
  'personality', 'devops',
];
for (const theme of themes) {
  const idx = join(root, 'data', 'themes', theme, 'data_structure.md');
  if (!existsSync(idx)) {
    writeFileSync(
      idx,
      `# ${theme}\n\n> Auto-generated. Updated as new rules are classified into this theme.\n\n## Rules\n\n(none yet)\n`,
      'utf-8'
    );
  }
}

// Top-level index
const indexContent = `# Self-Improve framework\n\n> Install path: ${root}\n> Version: 1.0.0 · Kiro edition\n\n## File map\n\n### Core docs\n- SKILL.md — discoverable entry\n- SYSTEM.md — full system docs\n- RUNTIME.md — execution flow + recovery\n- ENGINE.md — trigger rules + module lifecycle\n\n### Configuration\n- config.yaml — module registry + switches\n- user-config.yaml — user template\n\n### State\n- checkpoint.json — current run state\n- run-log.jsonl — historical progress\n- changelog.md — upgrade log\n\n### Data\n- data/hot.md — HOT layer (active rules)\n- data/corrections.md — correction log\n- data/reflections.md — self-reflection log\n- data/profile.md — team capability profile\n- data/feedback/ — raw feedback JSONL\n- data/themes/ — theme-classified rules\n- data/errors/ — error knowledge points\n- data/lessons/ — experience lessons\n- data/high-value/ — high-value item records\n- data/backup/ — pre-run backups\n- data/archive/ — cold storage\n\n### Output\n- proposals/PENDING.md — approval queue\n- drafts/ — blog drafts\n`;
writeFileSync(join(root, 'data_structure.md'), indexContent, 'utf-8');
console.log('[setup] wrote data_structure.md');

// ─── 5. Update config.yaml storage block ───────────────────────────

const configYamlPath = join(root, 'config.yaml');
if (existsSync(configYamlPath)) {
  let cfg = readFileSync(configYamlPath, 'utf-8');
  cfg = cfg.replace(/(\n  root: )"[^"]*"/, `$1"${root}"`);
  cfg = cfg.replace(/(\n  knowledge_root: )"[^"]*"/, `$1"${knowledgeRoot}"`);
  cfg = cfg.replace(/(\n  workspace_root: )"[^"]*"/, `$1"${workspaceRoot}"`);
  cfg = cfg.replace(/(\n  cron: )"[^"]*"/, `$1"${cronExpr}"`);
  cfg = cfg.replace(/(\n  model: )"[^"]*"/, `$1"${cronModel}"`);
  cfg = cfg.replace(/(\nupdated: )"[^"]*"/, `$1"${today}"`);
  writeFileSync(configYamlPath, cfg, 'utf-8');
  console.log('[setup] updated config.yaml paths');
}

// ─── 6. Write Cron proposal ────────────────────────────────────────

const workspaceNote = workspaceRoot
  ? `Scan ${workspaceRoot} for all agents under it.`
  : `Scan the configured OpenClaw workspace for all agents.`;

const notificationNote = owner.notification?.channel && owner.notification?.to
  ? `If proposals/PENDING.md has new entries, send a notification to ${owner.notification.channel}:${owner.notification.to}.`
  : `If proposals/PENDING.md has new entries, append a one-line summary to run-log.jsonl.`;

const cronMessage = `You are the Self-Improve runner. Execute these steps in order:

1. Read ${root}/RUNTIME.md for the authoritative execution flow.
2. Read ${root}/config.yaml for module registry and approval rules.
3. ${workspaceNote}
4. Run each enabled module in dependency order (see ENGINE.md).
5. ${notificationNote}
6. Update checkpoint.json and append to run-log.jsonl.
7. Final status must be one of: success | partial | failed | no_signals.`;

const cronJson = {
  name: 'self-improve',
  schedule: {
    kind: 'cron',
    expr: cronExpr,
    tz: ownerTz,
  },
  sessionTarget: 'isolated',
  payload: {
    kind: 'agentTurn',
    message: cronMessage,
    model: cronModel,
    agent: mainAgent,
  },
};

const proposal = `# Pending modification proposals

> Generated by scripts/setup.mjs on ${today}.
> Approve by editing your OpenClaw cron configuration; nothing is written until you do.

---

## [P-001] Add scheduled Cron task

- **Source:** self-improve setup
- **Target file:** \`openclaw.json\` (cron section)
- **Status:** ⏳ awaiting approval

\`\`\`json
${JSON.stringify(cronJson, null, 2)}
\`\`\`

**Why:** Runs the improvement pipeline every 3 days at 04:00 ${ownerTz}.

---

## [P-002] (optional) Add HEARTBEAT entry

- **Source:** self-improve setup
- **Target file:** \`HEARTBEAT.md\`
- **Status:** ⏳ awaiting approval

\`\`\`markdown
## Self-Improve (every 3 days)

- If last run ≥ 3 days ago → remind to trigger \`node scripts/improve.mjs\`.
- If proposals/PENDING.md has ⏳ entries → remind to review.
\`\`\`

**Why:** Lightweight, manual reminder between scheduled runs.
`;

writeFileSync(join(root, 'proposals', 'PENDING.md'), proposal, 'utf-8');
console.log('[setup] wrote proposals/PENDING.md');

// ─── Done ──────────────────────────────────────────────────────────

console.log('');
console.log('[setup] ✓ done');
console.log(`[setup] docs:    ${join(root, 'SYSTEM.md')}`);
console.log(`[setup] config:  ${join(root, 'config.yaml')}`);
console.log(`[setup] pending: ${join(root, 'proposals', 'PENDING.md')}`);
console.log('');
console.log('Next:');
console.log('  1. Review proposals/PENDING.md');
console.log('  2. Add the Cron task to your OpenClaw config');
console.log('  3. The pipeline will then run automatically every 3 days');
