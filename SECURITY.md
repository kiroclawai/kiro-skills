# Security Policy

## Reporting a Vulnerability

If you discover a security issue in any skill in this repository, please report it privately:

**Email:** niharatnewfold@gmail.com
**Subject line:** `[SECURITY] kiro-skills — <short description>`

Do **not** open a public GitHub issue for security vulnerabilities.

## What to Expect

- **Acknowledgment** within 48 hours
- **Initial assessment** within 5 business days
- **Fix timeline** depends on severity:
  - Critical (RCE, credential leak): 24–72 hours
  - High (privilege escalation, data exposure): 1 week
  - Medium/ Low: next regular release cycle

## Scope

Skills in this repository are run locally on operator machines. The threat model is:

- A skill accidentally executing a destructive command
- A skill leaking secrets to logs or output
- A skill making network calls the operator didn't approve
- A skill mishandling user-supplied paths or arguments

## What Skills Must Do

- ✅ Confirm before any destructive action (delete, overwrite, send, publish)
- ✅ Use SecretRefs / masked entry for credentials — never inline
- ✅ Validate paths and arguments before filesystem operations
- ✅ Log externally-networked actions clearly
- ✅ Fail closed (refuse to proceed) on unexpected input

## What Skills Must Not Do

- ❌ Embed credentials in source
- ❌ Make network calls without explicit user approval
- ❌ Exfiltrate environment variables to remote endpoints
- ❌ Modify files outside the working directory without confirmation
- ❌ Use `rm -rf` or equivalent without `--dry-run` first

## Bug Bounty

There is no formal bug bounty program. Genuine reports will be credited in the fix release notes.

---

*Security is a feature. Report issues, don't exploit them.*