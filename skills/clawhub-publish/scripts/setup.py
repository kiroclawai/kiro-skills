#!/usr/bin/env python3
"""clawhub-publish setup — initialize config and signing keys."""
from __future__ import annotations

import os
import secrets
import sys
from pathlib import Path

CONFIG_DIR = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "clawhub"
CONFIG_FILE = CONFIG_DIR / "config.toml"
SIGNING_KEY = CONFIG_DIR / "sign.key"


def ensure_config() -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if not CONFIG_FILE.exists():
        CONFIG_FILE.write_text(
            "# ClawHub config\n"
            "channel = \"Pawclaw01\"\n"
            "auto_sign = true\n"
            "auto_bump = true\n"
        )
        print(f"Created {CONFIG_FILE}")
    else:
        print(f"Config exists at {CONFIG_FILE}")


def ensure_signing_key() -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    if not SIGNING_KEY.exists():
        # 32-byte Ed25519-style key (we use SHA-256 over tarball, so this is just a salt)
        key = secrets.token_hex(32)
        SIGNING_KEY.write_text(key + "\n")
        SIGNING_KEY.chmod(0o600)
        print(f"Generated signing key at {SIGNING_KEY}")
        print("Backup this file — losing it requires re-signing all historical tarballs")
    else:
        print(f"Signing key exists at {SIGNING_KEY}")


def main() -> int:
    print("Setting up clawhub-publish...")
    ensure_config()
    ensure_signing_key()
    print()
    print("Next steps:")
    print("  1. Set CLAWHUB_API_KEY environment variable")
    print("     Get one at: https://clawhub.dev/settings/tokens")
    print("  2. Run: clawhub-publish validate ./skills/<your-skill>")
    print("  3. Run: clawhub-publish publish ./skills/<your-skill>")
    return 0


if __name__ == "__main__":
    sys.exit(main())