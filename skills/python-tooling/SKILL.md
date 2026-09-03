---
name: python-tooling
description: >
  Production Python project scaffolding and tooling config. Sets up a
  pyproject.toml with poetry/uv, ruff for lint+format, mypy strict, pytest
  with coverage, pre-commit hooks, and a CI workflow that runs all of it.
  Use when starting a Python project that needs to ship.
version: 1.0.0
author: Kiro
license: MIT
repository: https://github.com/Pawclaw01/kiro-skills
requirements:
  binaries:
    - python (>= 3.11)
    - uv (optional, recommended)
  env: []
tags:
  - python
  - tooling
  - pyproject
  - ruff
  - mypy
  - pytest
  - pre-commit
---

# Python Tooling

pyproject + ruff + mypy + pytest + pre-commit + CI. One skill, fully wired.

```bash
openclaw skills install python-tooling
```

---

## What it does

Generates a complete Python project structure with batteries-included tooling:

```
your-project/
├── pyproject.toml          # build + lint + format + test config (unified)
├── .pre-commit-config.yaml # runs ruff + mypy + pytest on commit
├── src/
│   └── your_project/
│       └── __init__.py
├── tests/
│   ├── __init__.py
│   └── test_smoke.py
├── .python-version         # pins interpreter for pyenv/uv
├── README.md
├── LICENSE
└── .github/workflows/ci.yml
```

## Configured tooling

| Tool | Role | Strict by default? |
|------|------|--------------------|
| **ruff** | lint + format (replaces flake8, isort, black) | yes |
| **mypy** | static type checking | yes (strict) |
| **pytest** | test runner with coverage | yes (≥ 80% target) |
| **pre-commit** | runs everything on commit | yes |
| **uv** | fast dependency management | optional but recommended |
| **GitHub Actions** | CI matrix on 3.11 / 3.12 / 3.13 | yes |

## Quick start

```bash
# Initialize a new project
python-tooling init my-project
cd my-project
uv sync
pre-commit install
git init && git add -A && git commit -m "chore: initial scaffold"

# Add to an existing project
python-tooling adopt
```

## pyproject.toml preview

```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = []

[project.optional-dependencies]
dev = ["pytest>=8", "pytest-cov", "ruff>=0.6", "mypy>=1.11"]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "N", "ASYNC", "S", "RUF"]

[tool.mypy]
strict = true
python_version = "3.11"

[tool.pytest.ini_options]
addopts = "--cov=src --cov-report=term-missing --cov-fail-under=80"
```

## Philosophy

Python tooling should be **fast, opinionated, and quiet**. Ruff for everything lint+format, mypy strict by default, tests fail under 80%. No config sprawl.
