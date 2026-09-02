#!/usr/bin/env node
/**
 * Self-Improve main loop (single-step scaffold).
 *
 * Usage:
 *   node scripts/improve.mjs                            # full loop
 *   node scripts/improve.mjs --step scan                # one step
 *   node scripts/improve.mjs --step distill             # one step
 *   node scripts/improve.mjs --step elevate             # one step
 *   node scripts/improve.mjs --step route               # one step
 *   node scripts/improve.mjs --step reflect             # one step
 *   node scripts/improve.mjs --step notify              # one step
 *   node scripts/improve.mjs --dry-run                  # log only
 *   node scripts/improve.mjs --config my-config.yaml    # custom config
 *   node scripts/improve.mjs --help
 *
 * Status:
 *   This is a runnable scaffold. Each step has a real file-IO structure
 *   (checkpoint updates, run-log appends, dry-run safety) and clearly
 *   marked TODO markers where actual LLM calls belong.
 *
 *   The pipeline is fully deterministic in this scaffold: feedback is
 *   parsed from existing JSONL files, themes are scanned, and the
 *   promotion / proposal heuristics are pure functions of input data.
 *   Drop in real LLM calls where the TODOs are; the surrounding I/O
 *   stays the same.
 */

import {
  readFileSync,
  writeFileSync,
  appendFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Constants ─────────────────────────────────────────────────────

const STEPS = ['backup', 'scan', 'distill', 'elevate', 'route', 'reflect', 'profile', 'notify'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = process.env.SELF_IMPROVE_ROOT
  || process.cwd();

// ─── CLI ───────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const opts = { step: null, dryRun: false, config: null };

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
  if (a === '--dry-run') { opts.dryRun = true; continue; }
  if (a === '--step' && argv[i + 1]) { opts.step = argv[++i]; continue; }
  if (a === '--config' && argv[i + 1]) { opts.config = argv[++i]; continue; }
  if (a === '--root' && argv[i + 1]) {
    process.env.SELF_IMPROVE_ROOT = argv[++i];
    continue;
  }
}

function printHelp() {
  console.log(`Self-Improve main loop

Usage:
  node scripts/improve.mjs [--step <name>] [--dry-run] [--config <file>] [--root <path>]

Steps (in execution order):
  backup   snapshot critical files to data/backup/<run_id>/
  scan     read memory logs and emit data/feedback/<date>.jsonl
  distill  three-level distillation + theme classification
  elevate  promote / demote rules between memory tiers
  route    decide output channel; write proposals/PENDING.md
  reflect  write self-reflection to data/reflections.md
  profile  update team capability profile (every 3rd run)
  notify   inform owner of pending proposals

Options:
  --step <name>   Run only one step (must be one of the names above)
  --dry-run       Log actions without writing files
  --config <f>    Path to user-config.yaml (for resolving paths)
  --root <path>   Override the install root
  --help, -h      Show this help`);
}

// ─── Tiny helpers ──────────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0];
}

function nowIso() {
  return new Date().toISOString();
}

function log(msg) {
  console.log(`[improve] ${msg}`);
}

function loadJsonl(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean);
}

function appendJsonl(file, obj) {
  appendFileSync(file, JSON.stringify(obj) + '\n', 'utf-8');
}

function loadJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}

function saveJson(file, obj) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf-8');
}

function appendRunLog(entry) {
  const file = join(ROOT, 'run-log.jsonl');
  if (!opts.dryRun) appendJsonl(file, entry);
}

// ─── Checkpoint ────────────────────────────────────────────────────

function loadCheckpoint() {
  return loadJson(join(ROOT, 'checkpoint.json'), {
    run_id: null,
    current_step: null,
    status: 'idle',
    completed_steps: [],
    pending_steps: [...STEPS],
    high_value_items: [],
    last_update: null,
  });
}

function saveCheckpoint(cp) {
  cp.last_update = nowIso();
  if (!opts.dryRun) saveJson(join(ROOT, 'checkpoint.json'), cp);
}

// ─── Step 0: backup ────────────────────────────────────────────────

function stepBackup(cp) {
  log('step 0 · backup');
  const runId = cp.run_id || nowIso().replace(/[:.]/g, '-');
  const dest = join(ROOT, 'data', 'backup', runId);

  const filesToCopy = [
    'data/hot.md',
    'data/corrections.md',
    'data/reflections.md',
    'data/profile.md',
    'config.yaml',
    'checkpoint.json',
  ];

  if (!opts.dryRun) {
    mkdirSync(dest, { recursive: true });
    for (const f of filesToCopy) {
      const src = join(ROOT, f);
      if (existsSync(src)) {
        const dst = join(dest, f);
        mkdirSync(dirname(dst), { recursive: true });
        writeFileSync(dst, readFileSync(src));
      }
    }
  }
  log(`  backed up ${filesToCopy.length} files to ${dest}`);
}

// ─── Step 1: scan ──────────────────────────────────────────────────
//
// TODO(llm): integrate with the live LLM that processes the agent's
// session logs. In the scaffold we read any pre-existing feedback
// files and report counts.

function stepScan(cp) {
  log('step 1 · scan');
  const feedbackDir = join(ROOT, 'data', 'feedback');
  mkdirSync(feedbackDir, { recursive: true });

  const todayFile = join(feedbackDir, `${today()}.jsonl`);
  const records = loadJsonl(todayFile);

  // TODO(llm): replace this stub with a real signal extractor that
  // walks memory/*.md, corrections.md, reflections.md, and emits
  // structured records into data/feedback/<date>.jsonl.
  // Expected record shape:
  //   { ts, agent, task, score, hint, source, theme }

  log(`  ${records.length} feedback record(s) for ${today()}`);
  appendRunLog({
    ts: nowIso(),
    run_id: cp.run_id,
    step: 'scan',
    count: records.length,
    output: todayFile,
  });
}

// ─── Step 2: distill + classify ────────────────────────────────────
//
// TODO(llm): replace the trivial copy-through below with three-level
// distillation (raw → atomic → principle) and theme classification.
// Output files: data/themes/<theme>/*.md

function stepDistill(cp) {
  log('step 2 · distill + classify');
  const feedbackDir = join(ROOT, 'data', 'feedback');
  if (!existsSync(feedbackDir)) {
    log('  no feedback directory; skipping');
    return;
  }

  const files = readdirSync(feedbackDir).filter((f) => f.endsWith('.jsonl'));
  let total = 0;
  for (const f of files) {
    total += loadJsonl(join(feedbackDir, f)).length;
  }

  // TODO(llm): for each feedback record, derive:
  //   1. atomic rule (one sentence, action-oriented)
  //   2. principle  (why it matters)
  //   3. theme      (one of the configured themes)
  // Write to data/themes/<theme>/<rule-id>.md with frontmatter:
  //   ---
  //   id: <rule-id>
  //   created: <iso>
  //   source: feedback#<n>
  //   uses: 0
  //   ---

  log(`  processed ${total} feedback record(s) across ${files.length} file(s)`);
  appendRunLog({
    ts: nowIso(),
    run_id: cp.run_id,
    step: 'distill',
    input_count: total,
    files: files.length,
  });
}

// ─── Step 3: elevate ───────────────────────────────────────────────

function stepElevate(cp) {
  log('step 3 · elevate');
  const hotPath = join(ROOT, 'data', 'hot.md');
  const themesDir = join(ROOT, 'data', 'themes');

  if (!existsSync(themesDir)) {
    log('  no themes directory; skipping');
    return;
  }

  // TODO(llm): implement promotion logic.
  //   For each rule in data/themes/<theme>/*.md:
  //     - count uses (frontmatter field `uses`)
  //     - if uses ≥ promote_threshold (default 3) within last 7 days:
  //         promote to data/hot.md
  //     - if not used in demote_days (default 30):
  //         demote back to its theme file
  //     - if not used in archive_days (default 90):
  //         move to data/archive/
  // Never delete; only ever demote.

  log('  promotion / demotion cycle complete');
  appendRunLog({ ts: nowIso(), run_id: cp.run_id, step: 'elevate' });
}

// ─── Step 4: route ──────────────────────────────────────────────────

function stepRoute(cp) {
  log('step 4 · route');
  const pendingPath = join(ROOT, 'proposals', 'PENDING.md');
  mkdirSync(dirname(pendingPath), { recursive: true });

  // TODO(llm): for each rule that crossed the solidification threshold,
  // decide the output channel:
  //   - rule          → append to proposals/PENDING.md (gated)
  //   - blog          → write draft to drafts/blog-<topic>.md
  //   - methodology   → write to {knowledge_root}/methodologies/<theme>.md
  //   - error         → write to data/errors/<theme>.md
  //   - lesson        → write to data/lessons/<theme>.md
  //   - skill update  → write to data/themes/skill-improvements/<task>.yaml
  //
  // For the scaffold we just emit a single placeholder proposal so the
  // pipeline remains observable end-to-end.

  if (!opts.dryRun) {
    const stamp = nowIso();
    const proposal = `\n## [P-${stamp}] scaffold placeholder\n\n- **Source:** scripts/improve.mjs scaffold\n- **Target file:** (none)\n- **Status:** ⏳ awaiting approval\n- **Note:** replace the scaffold stepRoute() with real LLM-driven routing.\n\n`;
    if (existsSync(pendingPath)) {
      appendFileSync(pendingPath, proposal, 'utf-8');
    } else {
      writeFileSync(
        pendingPath,
        `# Pending proposals\n\n> Generated ${stamp}\n${proposal}`,
        'utf-8'
      );
    }
  }
  log('  routed output to proposals/PENDING.md');
  appendRunLog({ ts: nowIso(), run_id: cp.run_id, step: 'route' });
}

// ─── Step 5: reflect ───────────────────────────────────────────────

function stepReflect(cp) {
  log('step 5 · reflect');
  const file = join(ROOT, 'data', 'reflections.md');

  // TODO(llm): replace with a real reflection prompt. Input:
  //   - this run's checkpoint
  //   - last 5 reflections
  //   - last run's high_value_items
  // Output: one paragraph appended to data/reflections.md

  const stamp = nowIso();
  const entry = `\n## ${stamp}\n\nRun id: ${cp.run_id}\nCompleted steps: ${cp.completed_steps.length}\n\n_Scaffold placeholder. Replace stepReflect() with a real reflection prompt._\n`;

  if (!opts.dryRun) {
    if (!existsSync(file)) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `# Self-reflection log\n${entry}`, 'utf-8');
    } else {
      appendFileSync(file, entry, 'utf-8');
    }
  }
  log('  reflection appended');
  appendRunLog({ ts: nowIso(), run_id: cp.run_id, step: 'reflect' });
}

// ─── Step 6: profile ───────────────────────────────────────────────

function stepProfile(cp) {
  log('step 6 · profile');
  // TODO(llm): regenerate data/profile.md from accumulated feedback
  // and reflections. The scaffold updates only the timestamp.
  const file = join(ROOT, 'data', 'profile.md');
  if (!existsSync(file)) {
    if (!opts.dryRun) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(
        file,
        `# Team capability profile\n\n> Updated: ${nowIso()}\n\n_Scaffold placeholder._\n`,
        'utf-8'
      );
    }
  } else {
    let content = readFileSync(file, 'utf-8');
    content = content.replace(/(> Updated: ).*/, `$1${nowIso()}`);
    if (!opts.dryRun) writeFileSync(file, content, 'utf-8');
  }
  log('  profile timestamp updated');
  appendRunLog({ ts: nowIso(), run_id: cp.run_id, step: 'profile' });
}

// ─── Step 7: notify ────────────────────────────────────────────────

function stepNotify(cp) {
  log('step 7 · notify');
  const pendingPath = join(ROOT, 'proposals', 'PENDING.md');

  const pendingCount = existsSync(pendingPath)
    ? (readFileSync(pendingPath, 'utf-8').match(/⏳ awaiting approval/g) || []).length
    : 0;

  // TODO(notify): wire to your messaging channel (Discord, Slack,
  // email). The scaffold appends to data/notification-log.jsonl.
  const file = join(ROOT, 'data', 'notification-log.jsonl');
  if (!opts.dryRun) {
    mkdirSync(dirname(file), { recursive: true });
    appendJsonl(file, {
      ts: nowIso(),
      run_id: cp.run_id,
      pending_count: pendingCount,
    });
  }
  log(`  ${pendingCount} pending proposal(s); notification logged`);
  appendRunLog({
    ts: nowIso(),
    run_id: cp.run_id,
    step: 'notify',
    pending_count: pendingCount,
  });
}

// ─── Driver ────────────────────────────────────────────────────────

async function run() {
  const cp = loadCheckpoint();
  cp.run_id = cp.run_id || nowIso().replace(/[:.]/g, '-');
  cp.status = 'in_progress';
  saveCheckpoint(cp);

  log(`run id: ${cp.run_id}`);
  log(`root:   ${ROOT}`);
  if (opts.dryRun) log('dry-run mode: no files will be written');

  const steps = opts.step ? [opts.step] : STEPS;

  for (const step of steps) {
    if (!STEPS.includes(step)) {
      log(`unknown step: ${step}; skipping`);
      continue;
    }

    cp.current_step = step;
    saveCheckpoint(cp);

    const start = Date.now();
    let status = 'success';
    try {
      switch (step) {
        case 'backup':  stepBackup(cp); break;
        case 'scan':    stepScan(cp); break;
        case 'distill': stepDistill(cp); break;
        case 'elevate': stepElevate(cp); break;
        case 'route':   stepRoute(cp); break;
        case 'reflect': stepReflect(cp); break;
        case 'profile': stepProfile(cp); break;
        case 'notify':  stepNotify(cp); break;
      }
    } catch (err) {
      status = 'failed';
      log(`  ✗ ${step} failed: ${err.message}`);
      appendRunLog({
        ts: nowIso(),
        run_id: cp.run_id,
        step,
        status: 'failed',
        error: err.message,
      });
      // fault-tolerant: continue to next step
    }

    cp.completed_steps.push({
      step,
      status,
      duration_ms: Date.now() - start,
    });
    cp.pending_steps = STEPS.filter((s) => !cp.completed_steps.find((c) => c.step === s));
  }

  cp.current_step = null;
  cp.status = cp.completed_steps.every((s) => s.status === 'success') ? 'success' : 'partial';
  saveCheckpoint(cp);

  log(`run finished: ${cp.status}`);
  log(`completed: ${cp.completed_steps.map((s) => `${s.step}=${s.status}`).join(', ')}`);
}

run().catch((err) => {
  console.error(`[improve] fatal: ${err.stack || err.message}`);
  process.exit(1);
});
