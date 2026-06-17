# Role Screens

| Role | Current page | Source path |
|---|---|---|
| Public visitor | Landing page | `apps/web/src/app/page.tsx` |
| Customer/auth user | Login | `apps/web/src/app/(auth)/login/page.tsx` |
| Customer | Dashboard | `apps/web/src/app/(customer)/dashboard/page.tsx` |
| Customer | New transfer | `apps/web/src/app/(customer)/transfers/new/page.tsx` |
| Customer | Transfer detail | `apps/web/src/app/(customer)/transfers/[transferId]/page.tsx` |
| Customer | New credit assessment | `apps/web/src/app/(customer)/credit-assessments/new/page.tsx` |
| Customer | Credit assessment detail | `apps/web/src/app/(customer)/credit-assessments/[creditAssessmentId]/page.tsx` |

## API Proxy Routes

| Route | Source path |
|---|---|
| `POST /api/auth/login` | `apps/web/src/app/api/auth/login/route.ts` |
| `POST /api/auth/logout` | `apps/web/src/app/api/auth/logout/route.ts` |
| `GET /api/auth/session` | `apps/web/src/app/api/auth/session/route.ts` |
