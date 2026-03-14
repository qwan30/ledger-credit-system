---
name: verification-loop
description: Run the repository verification loop after significant changes: build, typecheck, lint, test, security checks, and diff review for the TypeScript finance backend.
---

# Verification Loop

Use this skill near the end of a task or after a risky refactor. The goal is to verify the repository using the scripts and tooling the repo already defines, not to assume Claude-specific workflows.

## When to Use

- After a feature or bug fix
- Before asking for review
- After refactors in ledger, balance, credit, repayment, or integration code
- Before creating a commit in a non-trivial change set

## Execution Order

### 1. Build

If the repository defines a build script, run it through the package manager in use.

Preferred order:

1. package script such as `build`
2. framework-specific build command already checked into the repo
3. skip and report if the repo has no build step yet

### 2. Typecheck

Prefer the repo script first, then fall back to direct tooling only if the repo is clearly TypeScript-based and lacks a wrapper script.

Examples:

```bash
npm run typecheck
npm run check-types
npx tsc --noEmit
```

### 3. Lint

Run the repo lint script if present. If not present, report that linting is not configured instead of inventing a new workflow.

### 4. Tests

Run the narrowest meaningful test set first, then the broader suite if needed.

Typical order:

1. focused spec or module tests for the edited area
2. repo `test` script
3. coverage script if the repo exposes one

If the repository has no tests yet, report that directly.

### 5. Security Checks

Use fast repository-local checks even if no security tooling is installed yet.

Examples:

```bash
rg -n --glob '!node_modules' --glob '!dist' 'sk-|api[_-]?key|secret|token' .
rg -n --glob '!node_modules' --glob '!dist' 'console\\.log|TODO\\(security\\)' .
```

For finance-sensitive changes, also review:

- missing authorization checks
- missing idempotency enforcement
- floating-point money math
- missing audit-trail writes on state changes

### 6. Diff Review

Inspect the current diff, not an assumed previous commit.

Examples:

```bash
git diff --stat
git diff --name-only
git diff -- . ':(exclude)package-lock.json'
```

Check for:

- accidental file churn
- incomplete validation or error handling
- missing tests
- schema or contract drift

## Output Format

Return a compact report like this:

```text
VERIFICATION REPORT

Build: PASS | FAIL | NOT CONFIGURED
Types: PASS | FAIL | NOT CONFIGURED
Lint: PASS | FAIL | NOT CONFIGURED
Tests: PASS | FAIL | NOT CONFIGURED
Security: PASS | FAIL
Diff: N files reviewed

Outstanding issues:
1. ...
2. ...
```

## Finance-Domain Gate

Mark the task as not ready if any of the following are true:

- money values use floating-point arithmetic
- a money-moving path is not idempotent under retry
- a state-changing flow lacks an audit trail
- validation is missing at an external boundary
- security-sensitive changes were not reviewed
