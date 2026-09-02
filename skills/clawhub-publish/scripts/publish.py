#!/usr/bin/env python3
"""clawhub-publish — validate, build, sign, and publish OpenClaw skills.

Usage:
    clawhub-publish validate <skill-dir>
    clawhub-publish build <skill-dir>
    clawhub-publish sign <tarball>
    clawhub-publish publish <skill-dir> [--dry-run] [--skip-validate] [--no-sign]
    clawhub-publish status [--skill <name>]
    clawhub-publish rollback <skill-name> --version <version> [--reason <text>]
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path
from typing import Any

REQUIRED_FRONTMATTER = ["name", "description", "version", "author", "license"]
EXCLUDE_PATTERNS = [".git", "node_modules", "__pycache__", ".pyc", ".DS_Store", ".venv", "dist"]
MAX_FILE_SIZE = 1_048_576  # 1 MB
SECRET_PATTERNS = [
    r'(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*["\'][A-Za-z0-9_\-]{20,}["\']',
    r'(?i)-----BEGIN [A-Z ]+PRIVATE KEY-----',
    r'ghp_[A-Za-z0-9]{36,}',
    r'sk-[A-Za-z0-9]{40,}',
]


def log(level: str, msg: str) -> None:
    colors = {"info": "\033[36m", "ok": "\033[32m", "warn": "\033[33m", "err": "\033[31m", "end": "\033[0m"}
    prefix = {"info": "→", "ok": "✓", "warn": "!", "err": "✗"}.get(level, "·")
    c = colors.get(level, "")
    e = colors["end"]
    print(f"{c}{prefix}{e} {msg}", file=sys.stderr)


def parse_frontmatter(skill_md: Path) -> dict[str, str]:
    """Parse YAML frontmatter from SKILL.md (subset: scalars and block strings).

    Supports:
      key: value
      key: "quoted value"
      key: |
        multi-line block value
    """
    import re as _re

    text = skill_md.read_text()
    if not text.startswith("---\n"):
        raise ValueError("SKILL.md must start with ---")
    end = text.find("\n---", 4)
    if end == -1:
        raise ValueError("SKILL.md frontmatter not closed")
    block = text[4:end]

    result: dict[str, str] = {}
    lines = block.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        # Skip blanks and list items
        if not line.strip() or line.startswith(" ") or line.startswith("-") or line.startswith("#"):
            i += 1
            continue
        m = _re.match(r"^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$", line)
        if not m:
            i += 1
            continue
        key = m.group(1)
        first = m.group(2).strip()
        # Handle block scalars (| or >) — collect indented continuation lines
        if first in {"|", ">", "|+", "|-", ">+", ">-"}:
            collected = []
            i += 1
            while i < len(lines) and (lines[i].startswith(" ") or lines[i].startswith("\t") or not lines[i].strip()):
                if lines[i].strip():
                    collected.append(lines[i].strip())
                i += 1
            result[key] = " ".join(collected)
            continue
        # Strip wrapping quotes
        value = first
        if value.startswith('"') and value.endswith('"'):
            value = value[1:-1]
        elif value.startswith("'") and value.endswith("'"):
            value = value[1:-1]
        result[key] = value
        i += 1
    return result


def validate(skill_dir: Path) -> tuple[bool, list[str]]:
    """Validate a skill directory. Returns (ok, errors)."""
    errors: list[str] = []
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        errors.append("Missing SKILL.md")
        return False, errors

    try:
        fm = parse_frontmatter(skill_md)
    except ValueError as e:
        errors.append(f"Invalid frontmatter: {e}")
        return False, errors

    for key in REQUIRED_FRONTMATTER:
        if key not in fm:
            errors.append(f"Missing frontmatter field: {key}")

    if "description" in fm:
        desc_len = len(fm["description"])
        if desc_len < 50:
            errors.append(f"Description too short ({desc_len} chars, min 50)")
        elif desc_len > 600:
            errors.append(f"Description too long ({desc_len} chars, max 600)")

    if "version" in fm and not re.match(r"^\d+\.\d+\.\d+", fm["version"]):
        errors.append(f"Invalid version format: {fm['version']} (use semver)")

    if not (skill_dir / "README.md").exists():
        errors.append("Missing README.md")

    # Scan for secrets
    for path in skill_dir.rglob("*"):
        if path.is_file() and path.suffix in {".md", ".json", ".yaml", ".yml", ".py", ".js", ".ts", ".sh"}:
            try:
                content = path.read_text(errors="ignore")
                for pattern in SECRET_PATTERNS:
                    if re.search(pattern, content):
                        errors.append(f"Possible secret in {path.relative_to(skill_dir)}: matches {pattern[:30]}...")
            except Exception:
                pass

    # Check file sizes
    for path in skill_dir.rglob("*"):
        if path.is_file() and path.stat().st_size > MAX_FILE_SIZE:
            errors.append(f"Large file: {path.relative_to(skill_dir)} ({path.stat().st_size:,} bytes)")

    return (len(errors) == 0), errors


def build_tarball(skill_dir: Path, output_dir: Path) -> Path:
    """Create a versioned tarball from a skill directory."""
    fm = parse_frontmatter(skill_dir / "SKILL.md")
    name = fm.get("name", skill_dir.name)
    version = fm.get("version", "0.1.0")

    output_dir.mkdir(parents=True, exist_ok=True)
    tarball_path = output_dir / f"{name}-{version}.tgz"

    files_to_add = []
    for path in sorted(skill_dir.rglob("*")):
        if path.is_file() and not any(ex in path.parts for ex in EXCLUDE_PATTERNS):
            files_to_add.append(path)

    with tarfile.open(tarball_path, "w:gz") as tar:
        for path in files_to_add:
            arcname = path.relative_to(skill_dir.parent)
            tar.add(path, arcname=arcname)

    log("ok", f"Built {tarball_path} ({tarball_path.stat().st_size:,} bytes, {len(files_to_add)} files)")
    return tarball_path


def sign_tarball(tarball: Path) -> Path:
    """Generate a SHA-256 signature file alongside the tarball."""
    sig_path = tarball.with_suffix(tarball.suffix + ".sig")
    h = hashlib.sha256()
    with tarball.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    sig_path.write_text(f"sha256:{h.hexdigest()}\n")
    log("ok", f"Signed {tarball.name} ({h.hexdigest()[:16]}...)")
    return sig_path


def main() -> int:
    parser = argparse.ArgumentParser(prog="clawhub-publish")
    sub = parser.add_subparsers(dest="cmd")

    p_validate = sub.add_parser("validate")
    p_validate.add_argument("skill_dir", type=Path)

    p_build = sub.add_parser("build")
    p_build.add_argument("skill_dir", type=Path)
    p_build.add_argument("--output", type=Path, default=Path("dist"))

    p_sign = sub.add_parser("sign")
    p_sign.add_argument("tarball", type=Path)

    p_publish = sub.add_parser("publish")
    p_publish.add_argument("skill_dir", type=Path)
    p_publish.add_argument("--dry-run", action="store_true")
    p_publish.add_argument("--skip-validate", action="store_true")
    p_publish.add_argument("--no-sign", action="store_true")
    p_publish.add_argument("--channel", default=os.environ.get("CLAWHUB_CHANNEL"))

    p_status = sub.add_parser("status")
    p_status.add_argument("--skill")

    p_rollback = sub.add_parser("rollback")
    p_rollback.add_argument("skill_name")
    p_rollback.add_argument("--version", required=True)
    p_rollback.add_argument("--reason")

    args = parser.parse_args()

    if args.cmd == "validate":
        ok, errors = validate(args.skill_dir)
        if ok:
            log("ok", f"{args.skill_dir.name} is valid")
            return 0
        for e in errors:
            log("err", e)
        return 1

    elif args.cmd == "build":
        if not (args.skill_dir / "SKILL.md").exists():
            log("err", "No SKILL.md found")
            return 2
        tarball = build_tarball(args.skill_dir, args.output)
        print(str(tarball))
        return 0

    elif args.cmd == "sign":
        sign_tarball(args.tarball)
        return 0

    elif args.cmd == "publish":
        if not args.skip_validate:
            ok, errors = validate(args.skill_dir)
            if not ok:
                for e in errors:
                    log("err", e)
                return 1

        channel = args.channel or "Pawclaw01"
        fm = parse_frontmatter(args.skill_dir / "SKILL.md")
        name = fm.get("name", args.skill_dir.name)
        version = fm.get("version", "0.1.0")

        log("info", f"Publishing {name} v{version} to channel {channel}")
        if args.dry_run:
            log("info", "DRY RUN — would publish, not actually uploading")

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            tarball = build_tarball(args.skill_dir, tmp_path)
            if not args.no_sign:
                sign_tarball(tarball)
            if not args.dry_run:
                api_key = os.environ.get("CLAWHUB_API_KEY")
                if not api_key:
                    log("err", "CLAWHUB_API_KEY not set")
                    return 2
                log("info", "Upload step skipped (no live ClawHub endpoint configured)")
                log("ok", f"Would publish {tarball.name} to {channel}")
            else:
                log("ok", f"Dry run complete: {tarball}")
        return 0

    elif args.cmd == "status":
        log("info", "Status check requires CLAWHUB_API_KEY and channel config")
        return 0

    elif args.cmd == "rollback":
        log("info", f"Would rollback {args.skill_name} to remove v{args.version}")
        log("warn", "Rollback requires channel admin privileges")
        return 0

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())