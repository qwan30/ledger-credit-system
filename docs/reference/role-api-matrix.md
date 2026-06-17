# Role API Matrix

| Route group | CUSTOMER | OPS | ANALYST | AUDITOR | ADMIN | SYSTEM | API_CLIENT |
|---|---|---|---|---|---|---|---|
| Health | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Auth login/refresh/logout | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Auth admin | No | No | No | No | Yes | No | No |
| Accounts | Own data | Authorized read | Authorized read | Authorized read | Authorized read | No | Scoped |
| Transfers | Own data | Read/action | Read | Read | Read/action | Workflow | Scoped |
| External rail callbacks | No | No | No | No | No | Provider/system | Provider/system |
| Credit | Own request | Read/action | Review/action | Read | Review/action | Workflow | Scoped |
| Batch | No | Read/retry | No | Read | Read/retry | Scheduler | No |
| Ops audit | No | Yes | No | Yes | Yes | No | No |

Source truth: controller guards and `src/common/auth/*`.
