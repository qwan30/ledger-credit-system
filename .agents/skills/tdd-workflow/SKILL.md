---
name: tdd-workflow
description: Use when writing or changing TypeScript backend behavior for ledger, balance, credit limit, repayment, or API flows. Enforces tests-first development, exact-money assertions, idempotency checks, and coverage expectations.
---

# TDD Workflow

Follow this skill for substantive backend changes. The goal is to make business behavior explicit before implementation and keep finance-sensitive logic safe under change.

## When to Use

- New API endpoints or service methods
- Changes to ledger posting, balance calculation, limit reservation, or repayment logic
- Bug fixes in validation, transaction handling, or external integrations
- Refactors that touch money movement or state transitions

## Core Rules

1. Write the failing test before the implementation.
2. Test exact money behavior with integers, decimals, or domain value objects. Never rely on floating-point comparisons.
3. Cover idempotency, retries, duplicate requests, and partial-failure recovery on money-moving flows.
4. Verify audit-trail expectations for any state-changing operation.
5. Prefer unit plus integration coverage for backend work. Add end-to-end coverage only when the repo actually has end-to-end infrastructure.

## Workflow

### Step 1: Define the behavior

Capture the business rule in one or two sentences before writing tests.

```text
When a repayment is submitted twice with the same idempotency key,
the second call must return the original result and must not create a second ledger entry.
```

### Step 2: List the test cases

Include happy path, validation, boundary conditions, and operational failure modes.

Minimum checklist for finance-domain changes:

- valid request succeeds
- invalid input is rejected at the boundary
- duplicate request stays idempotent
- transaction or dependency failure leaves state consistent
- ledger and balance projections match expected values

### Step 3: Write the failing tests

Use the repository's existing test runner if one exists. Prefer package scripts over tool-specific commands.

```bash
# If package.json exposes a script, use it through the repo's package manager.
npm test -- --runInBand

# If the repo uses a direct TypeScript test runner, use that instead.
npx vitest run path/to/spec.ts
```

### Step 4: Implement the minimum change

Write only enough code to satisfy the failing tests. Keep business rules in domain or service code, not scattered across handlers.

### Step 5: Refactor with tests still green

Refactor names, extraction boundaries, or shared helpers only after behavior is covered. Keep the public behavior unchanged.

### Step 6: Run the verification pass

After the focused tests pass, run the repo-level verification flow from `$verification-loop`.

## Test Design Guidance

### Unit tests

Use for:

- money arithmetic helpers
- status-transition rules
- fee, interest, or limit calculations
- idempotency key normalization
- request validation mappers

Example:

```typescript
describe("applyRepayment", () => {
  it("reduces principal and records an exact ledger delta", () => {
    const result = applyRepayment({
      outstandingPrincipalMinor: 125_00n,
      repaymentMinor: 25_00n,
    });

    expect(result.outstandingPrincipalMinor).toBe(100_00n);
    expect(result.ledgerDeltaMinor).toBe(-25_00n);
  });
});
```

### Integration tests

Use for:

- handler plus validation plus persistence
- transaction boundaries
- duplicate request protection
- external provider failure handling

Example:

```typescript
describe("POST /repayments", () => {
  it("does not create a duplicate repayment for the same idempotency key", async () => {
    const payload = {
      loanId: "loan_123",
      repaymentMinor: "2500",
    };

    const first = await submitRepayment(payload, "idem-1");
    const second = await submitRepayment(payload, "idem-1");

    expect(second.status).toBe(200);
    expect(second.body.repaymentId).toBe(first.body.repaymentId);
    expect(await countLedgerEntriesForRepayment(first.body.repaymentId)).toBe(1);
  });
});
```

### Contract or adapter tests

Use for:

- payment gateway adapters
- credit bureau or underwriting integrations
- message publishing or outbox behavior

Mock the external system narrowly. Assert request shape, retries, and failure mapping.

## File Layout

Prefer colocated or feature-based tests.

```text
src/
  modules/
    ledger/
      ledger.service.ts
      ledger.service.test.ts
    repayments/
      create-repayment.ts
      create-repayment.test.ts
tests/
  integration/
    repayments.create.spec.ts
  contracts/
    payment-provider.spec.ts
```

## Completion Criteria

Before closing the task:

1. The new behavior is covered by failing-then-passing tests.
2. Edge cases for exact money, retries, and consistency are covered.
3. The repo verification pass has been run or the missing pieces were reported explicitly.
