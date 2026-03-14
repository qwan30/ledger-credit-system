---
name: ui-ux-pro-max
description: UI and UX design intelligence for dashboard, admin, and other frontend interface work. Use only when the task explicitly involves page layout, components, visual design, accessibility, interaction patterns, or admin console UX. Skip for normal backend-only work.
---

# UI UX Pro Max

This skill vendors the upstream UI/UX Pro Max search assets into this repository for explicit frontend or admin-surface work. It is intentionally explicit-only in this project.

## When to Use

- Designing or reviewing an admin dashboard
- Planning a frontend page, component, or information hierarchy
- Choosing layout, typography, color, spacing, motion, or chart patterns
- Auditing accessibility or interaction quality in a web UI

Do not use this skill for normal backend changes.

## Quick Workflow

### 1. Generate a design system

Run the local search tool from this skill directory:

```bash
python scripts/search.py "credit dashboard fintech admin" --design-system -p "Ledger Credit System"
```

Use `-f markdown` if you want markdown output instead of the default ASCII view.

### 2. Search a specific domain

```bash
python scripts/search.py "accessibility form validation" --domain ux
python scripts/search.py "fintech trust" --domain color
python scripts/search.py "portfolio admin" --domain style
python scripts/search.py "repayment analytics" --domain chart
```

Available domains:

- `style`
- `color`
- `chart`
- `landing`
- `product`
- `ux`
- `typography`
- `icons`
- `react`
- `web`
- `google-fonts`

### 3. Search stack guidance

```bash
python scripts/search.py "navigation tables filters" --stack react-native
```

## How to Apply Results

Use the tool output as design guidance, not as a direct instruction to rewrite the whole product.

For this repository, prefer using it to:

- shape future admin and dashboard screens
- review accessibility and usability of internal tools
- choose chart types and visual hierarchy for credit or repayment data
- avoid generic UI patterns when a frontend is introduced later

## Local Assets

This skill depends on the vendored `data/` and `scripts/` directories inside the same folder. The search tool reads the local CSV catalog and does not require the upstream repository at runtime.
