# Security Architecture

## Authentication And Identity

| Capability | Source anchor |
|---|---|
| JWT payload and guards | `src/common/auth/jwt-payload.ts`, `src/common/auth/auth.guard.ts` |
| Roles guard | `src/common/auth/roles.guard.ts`, `src/common/auth/roles.decorator.ts` |
| Public route marker | `src/common/auth/public.decorator.ts` |
| Password hashing | `src/common/auth/password-hasher.ts` |
| Token hashing | `src/common/auth/token-hasher.ts` |
| OIDC verifier support | `src/common/auth/oidc-identity-verifier.ts` |
| Admin provisioning | `src/modules/auth/auth-provisioning.service.ts` |
| Auth routes | `src/modules/auth/auth.controller.ts` |

## Session And Token Handling

The schema includes `AuthSession` and `RefreshToken` records. Refresh token rotation is represented by `replacedByTokenId`, revocation timestamps, and session status.

## Role Model

Roles are stored through `RoleBinding`, and actor categories use `ActorType`: `CUSTOMER`, `OPS`, `ANALYST`, `AUDITOR`, `ADMIN`, `SYSTEM`, and `API_CLIENT`.

## Runtime Security Controls

| Control | Current implementation | Caveat |
|---|---|---|
| Helmet | Registered in `src/bootstrap.ts` | Keep enabled for deployments |
| Rate limiting | Config-driven Fastify rate limit | Tune per route if traffic grows |
| CORS | `origin: true` | Permissive local/default posture; harden before deployment |
| Correlation ID | Request hook sets/generates `X-Correlation-Id` | Propagate to external systems if added |
| Pino redaction | Authorization, cookie, set-cookie headers redacted | Add paths if new secrets enter logs |
| External rail callback secret | `EXTERNAL_RAIL_CALLBACK_SECRET` in `.env.example` | Use non-demo secret per environment |

## Secrets

Secrets are represented as environment variables in `.env.example`. Do not commit environment-specific values. The seed data contains demo credentials for local bootstrap; treat them as demo-only and rotate for any shared environment.

## Security Review Triggers

Run security review for auth, authorization, secrets, transfers, ledger, credit, repayments, external rails, and privileged admin or ops actions.
