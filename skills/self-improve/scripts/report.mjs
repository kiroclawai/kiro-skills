#!/usr/bin/env node
/**
 * Self-Improve summary report generator.
 *
 * Usage:
 *   node scripts/report.mjs                            # last 7 days
 *   node scripts/report.mjs --days 30                  # last 30 days
 *   node scripts/report.mjs --format markdown          # markdown output
 *   node scripts/report.mjs --format text              # plain text (default)
 *   node scripts/report.mjs --output report.md         # write to file
 *   node scripts/report.mjs --root /path/to/self-improve
 *   node scripts/report.mjs --help
 *
 * Reads feedback JSONL files, run-log, checkpoint, corrections,
 * reflections, pending proposals; prints a structured summary.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { join } from 'node:path';

// ─── CLI ───────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const opts = { days: 7, format: 'text', output: null, root: null };

for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
  if (a === '--days' && argv[i + 1]) { opts.days = parseInt(argv[++i], 10); continue; }
  if (a === '--format' && argv[i + 1]) { opts.format = argv[++i]; continue; }
  if (a === '--output' && argv[i + 1]) { opts.output = argv[++i]; continue; }
  if (a === '--root' && argv[i + 1]) { opts.root = argv[++i]; continue; }
}

function printHelp() {
  console.log(`Self-Improve report generator

Usage:
  node scripts/report.mjs [--days N] [--format text|markdown] [--output <file>] [--root <path>]

Options:
  --days N         Look back N days (default 7)
  --format <fmt>   Output format: text (default) or markdown
  --output <file>  Write the report to a file instead of stdout
  --root <path>    Install root (default: \$SELF_IMPROVE_ROOT or cwd)
  --help, -h       Show this help`);
}

if (!Number.isFinite(opts.days) || opts.days <= 0) {
  console.error('[report] --days must be a positive integer');
  process.exit(1);
}
if (opts.format !== 'text' && opts.format !== 'markdown') {
  console.error('[report] --format must be "text" or "markdown"');
  process.exit(1);
}

// ─── Resolve paths ─────────────────────────────────────────────────

const ROOT = opts.root || process.env.SELF_IMPROVE_ROOT || process.cwd();
const FEEDBACK_DIR = join(ROOT, 'data', 'feedback');
const SKILLS_DIR   = join(ROOT, 'data', 'skills');
const CORRECTIONS  = join(ROOT, 'data', 'corrections.md');
const REFLECTIONS  = join(ROOT, 'data', 'reflections.md');
const HOT          = join(ROOT, 'data', 'hot.md');
const PENDING      = join(ROOT, 'proposals', 'PENDING.md');
const CHECKPOINT   = join(ROOT, 'checkpoint.json');

// ─── Helpers ───────────────────────────────────────────────────────

function safeRead(file) {
  return existsSync(file) ? readFileSync(file, 'utf-8') : '';
}

function safeReadJson(file, fallback = null) {
  if (!existsSync(file)) return fallback;
  try { return JSON.parse(readFileSync(file, 'utf-8')); } catch { return fallback; }
}

function loadFeedback(days) {
  const records = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const fp = join(FEEDBACK_DIR, `${dateStr}.jsonl`);
    if (!existsSync(fp)) continue;
    for (const line of readFileSync(fp, 'utf-8').split('\n')) {
      if (!line.trim()) continue;
      try { records.push(JSON.parse(line)); } catch { /* skip */ }
    }
  }
  return records;
}

function countLines(file) {
  if (!existsSync(file)) return 0;
  return readFileSync(file, 'utf-8').split('\n').filter((l) => l.trim()).length;
}

function countMatches(file, pattern) {
  if (!existsSync(file)) return 0;
  return (readFileSync(file, 'utf-8').match(pattern) || []).length;
}

function avg(arr) {
  return arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
}

function fmtPct(n) {
  return n === null ? 'N/A' : `${(n * 100).toFixed(0)}%`;
}

function fmtNum(n) {
  return n === null ? 'N/A' : n.toFixed(2);
}

// ─── Build report payload ──────────────────────────────────────────

function build() {
  const records = loadFeedback(opts.days);
  const scores = records.map((r) => r.score).filter((s) => typeof s === 'number');
  const positive = scores.filter((s) => s > 0).length;
  const negative = scores.filter((s) => s < 0).length;

  const byAgent = {};
  for (const r of records) {
    if (!r.agent) continue;
    if (!byAgent[r.agent]) byAgent[r.agent] = [];
    byAgent[r.agent].push(r);
  }

  const byTask = {};
  for (const r of records) {
    if (!r.task) continue;
    if (!byTask[r.task]) byTask[r.task] = [];
    byTask[r.task].push(r);
  }

  const hints = records.filter((r) => r.hint && r.score < 0).map((r) => r.hint);
  const hintFreq = {};
  for (const h of hints) hintFreq[h] = (hintFreq[h] || 0) + 1;
  const topIssues = Object.entries(hintFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const skillFiles = existsSync(SKILLS_DIR)
    ? readdirSync(SKILLS_DIR).filter((f) => f.endsWith('.yaml'))
    : [];
  const recentlyImproved = [];
  for (const f of skillFiles) {
    const content = safeRead(join(SKILLS_DIR, f));
    const updated = content.match(/updated: "([^"]+)"/)?.[1];
    const version = content.match(/version: "([^"]+)"/)?.[1];
    if (updated && new Date(updated) > new Date(Date.now() - opts.days * 86_400_000)) {
      recentlyImproved.push({ name: f.replace('.yaml', ''), version, updated });
    }
  }

  const cp = safeReadJson(CHECKPOINT, null);
  const pendingCount = countMatches(PENDING, /⏳ awaiting approval/g);

  return {
    generated_at: new Date().toISOString(),
    window_days: opts.days,
    totals: {
      feedback: records.length,
      scored: scores.length,
      positive,
      negative,
      success_rate: scores.length ? positive / scores.length : null,
      avg_score: avg(scores),
    },
    byAgent: Object.entries(byAgent)
      .map(([agent, recs]) => {
        const s = recs.map((r) => r.score).filter((x) => typeof x === 'number');
        return {
          agent,
          count: recs.length,
          success_rate: s.length ? s.filter((x) => x > 0).length / s.length : null,
          avg_score: avg(s),
        };
      })
      .sort((a, b) => b.count - a.count),
    byTask: Object.entries(byTask)
      .map(([task, recs]) => {
        const s = recs.map((r) => r.score).filter((x) => typeof x === 'number');
        return { task, count: recs.length, avg_score: avg(s) };
      })
      .sort((a, b) => b.count - a.count),
    topIssues: topIssues.map(([hint, count]) => ({ hint, count })),
    skills: {
      total: skillFiles.length,
      recently_improved: recentlyImproved,
    },
    state: {
      hot_lines: countLines(HOT),
      corrections_lines: countLines(CORRECTIONS),
      reflections_lines: countLines(REFLECTIONS),
      pending_proposals: pendingCount,
      last_run_status: cp?.status ?? 'unknown',
      last_run_id: cp?.run_id ?? null,
      last_update: cp?.last_update ?? null,
    },
  };
}

// ─── Renderers ─────────────────────────────────────────────────────

function renderText(p) {
  const lines = [];
  lines.push(`Self-Improve report — ${p.generated_at}`);
  lines.push(`Window: last ${p.window_days} day(s)`);
  lines.push('');
  lines.push('## Totals');
  lines.push(`  feedback records:  ${p.totals.feedback}`);
  lines.push(`  scored:            ${p.totals.scored}`);
  lines.push(`  positive / neg:    ${p.totals.positive} / ${p.totals.negative}`);
  lines.push(`  success rate:      ${fmtPct(p.totals.success_rate)}`);
  lines.push(`  avg score:         ${fmtNum(p.totals.avg_score)}`);
  lines.push('');

  if (p.byAgent.length) {
    lines.push('## By agent');
    for (const a of p.byAgent) {
      lines.push(`  ${a.agent.padEnd(20)} n=${String(a.count).padStart(4)}  success=${fmtPct(a.success_rate).padStart(5)}  avg=${fmtNum(a.avg_score)}`);
    }
    lines.push('');
  }

  if (p.byTask.length) {
    lines.push('## By task');
    for (const t of p.byTask) {
      lines.push(`  ${t.task.padEnd(20)} n=${String(t.count).padStart(4)}  avg=${fmtNum(t.avg_score)}`);
    }
    lines.push('');
  }

  if (p.topIssues.length) {
    lines.push('## Top issues');
    for (const i of p.topIssues) {
      const marker = i.count >= 3 ? '  🔔' : '';
      lines.push(`  ${String(i.count).padStart(3)}x "${i.hint}"${marker}`);
    }
    lines.push('');
  }

  if (p.skills.recently_improved.length) {
    lines.push('## Skill improvements');
    for (const s of p.skills.recently_improved) {
      lines.push(`  ${s.name} → v${s.version}  (${s.updated})`);
    }
    lines.push('');
  }

  lines.push('## System state');
  lines.push(`  hot.md lines:          ${p.state.hot_lines}`);
  lines.push(`  corrections.md lines:  ${p.state.corrections_lines}`);
  lines.push(`  reflections.md lines:  ${p.state.reflections_lines}`);
  lines.push(`  pending proposals:     ${p.state.pending_proposals}`);
  lines.push(`  last run status:       ${p.state.last_run_status}`);
  if (p.state.last_run_id) lines.push(`  last run id:           ${p.state.last_run_id}`);
  if (p.state.last_update) lines.push(`  last update:           ${p.state.last_update}`);

  if (p.state.pending_proposals > 0) {
    lines.push('');
    lines.push(`🔔 ${p.state.pending_proposals} pending proposal(s) — review proposals/PENDING.md`);
  }

  return lines.join('\n') + '\n';
}

function renderMarkdown(p) {
  const lines = [];
  lines.push(`# Self-Improve report — ${p.generated_at}`);
  lines.push(``);
  lines.push(`Window: last **${p.window_days}** day(s).`);
  lines.push(``);

  lines.push(`## Totals`);
  lines.push(``);
  lines.push(`| Metric | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Feedback records | ${p.totals.feedback} |`);
  lines.push(`| Scored | ${p.totals.scored} |`);
  lines.push(`| Positive / Negative | ${p.totals.positive} / ${p.totals.negative} |`);
  lines.push(`| Success rate | ${fmtPct(p.totals.success_rate)} |`);
  lines.push(`| Average score | ${fmtNum(p.totals.avg_score)} |`);
  lines.push(``);

  if (p.byAgent.length) {
    lines.push(`## By agent`);
    lines.push(``);
    lines.push(`| Agent | Count | Success rate | Avg score |`);
    lines.push(`|---|---|---|---|`);
    for (const a of p.byAgent) {
      lines.push(`| ${a.agent} | ${a.count} | ${fmtPct(a.success_rate)} | ${fmtNum(a.avg_score)} |`);
    }
    lines.push(``);
  }

  if (p.byTask.length) {
    lines.push(`## By task`);
    lines.push(``);
    lines.push(`| Task | Count | Avg score |`);
    lines.push(`|---|---|---|`);
    for (const t of p.byTask) {
      lines.push(`| ${t.task} | ${t.count} | ${fmtNum(t.avg_score)} |`);
    }
    lines.push(``);
  }

  if (p.topIssues.length) {
    lines.push(`## Top issues`);
    lines.push(``);
    for (const i of p.topIssues) {
      const marker = i.count >= 3 ? ' 🔔' : '';
      lines.push(`- **${i.count}×** "${i.hint}"${marker}`);
    }
    lines.push(``);
  }

  if (p.skills.recently_improved.length) {
    lines.push(`## Skill improvements`);
    lines.push(``);
    for (const s of p.skills.recently_improved) {
      lines.push(`- \`${s.name}\` → v${s.version} (${s.updated})`);
    }
    lines.push(``);
  }

  lines.push(`## System state`);
  lines.push(``);
  lines.push(`| Item | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| hot.md lines | ${p.state.hot_lines} |`);
  lines.push(`| corrections.md lines | ${p.state.corrections_lines} |`);
  lines.push(`| reflections.md lines | ${p.state.reflections_lines} |`);
  lines.push(`| Pending proposals | ${p.state.pending_proposals} |`);
  lines.push(`| Last run status | ${p.state.last_run_status} |`);
  if (p.state.last_run_id) lines.push(`| Last run id | ${p.state.last_run_id} |`);
  if (p.state.last_update) lines.push(`| Last update | ${p.state.last_update} |`);

  if (p.state.pending_proposals > 0) {
    lines.push(``);
    lines.push(`> 🔔 **${p.state.pending_proposals}** pending proposal(s) — review \`proposals/PENDING.md\``);
  }

  return lines.join('\n') + '\n';
}

// ─── Main ──────────────────────────────────────────────────────────

const payload = build();
const out = opts.format === 'markdown' ? renderMarkdown(payload) : renderText(payload);

if (opts.output) {
  writeFileSync(opts.output, out, 'utf-8');
  console.error(`[report] wrote ${opts.output}`);
} else {
  process.stdout.write(out);
}
