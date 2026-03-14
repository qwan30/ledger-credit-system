---
name: web-design-guidelines
description: Audit web UI files for accessibility, interaction, and UX issues. Use only when the task explicitly asks to review a page, admin panel, dashboard, or frontend UI against web best practices.
---

# Web Design Guidelines

Use this skill for explicit UI reviews. It is not part of the normal backend workflow for this repository.

## Workflow

1. Fetch the latest guideline source from:

```text
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

2. Read the file or file pattern the user wants reviewed.
3. Apply the fetched rules.
4. Return concise findings in `file:line` style.

## When to Use

- "review my UI"
- "check accessibility"
- "audit this dashboard"
- "review this admin page"
- "check this frontend against best practices"

## When Not to Use

- backend-only code changes
- API or database review
- finance-domain logic validation

## Review Focus

Prioritize:

- accessibility and keyboard behavior
- form usability and validation clarity
- focus states and interaction feedback
- responsive layout issues
- performance and rendering pitfalls visible in UI code
