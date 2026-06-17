# Automation Tasks

**Last Updated:** 2026-03-15

## Target Scheduled Tasks

### `end-of-day-interest-close`

Status:

- target requirement

Purpose:

- close the business day and apply overnight interest or close-related journal entries

Expected behavior:

- starts within the configured close window
- processes eligible accounts in deterministic chunks
- records a durable batch run and audit evidence
- retries safely without duplicating postings

Operational outputs:

- processed account count
- duration
- failure summary
- batch status for later review

## Planned Or Assumption-Level Automations

### `failed-transfer-follow-up`

Status:

- planned placeholder

Purpose:

- periodically surface transfer requests that require manual review or compensation follow-up

### `credit-policy-recalibration`

Status:

- assumption-level placeholder

Purpose:

- future job to recalculate or evaluate policy drift for scoring inputs

Note:

- this automation is not guaranteed by the seed brief and should not be treated as committed scope

## Automation Rules

- every automation must produce a durable execution record
- automations that can affect money movement require retry-safe semantics
- operationally sensitive automation actions should produce audit events
