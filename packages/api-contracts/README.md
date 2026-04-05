# API Contracts

This package freezes the current REST contract before the Java rewrite.

- `openapi/openapi.yaml` is the human-reviewed source of truth for wave 1 parity.
- `generated/types.d.ts` is generated from the OpenAPI file and consumed by the Next.js BFF and future contract tests.

Generation:

```bash
npm run contracts:generate
```
