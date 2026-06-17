# Seed Data

## Source Files

| File | Purpose |
|---|---|
| `prisma/seed.ts` | Creates a Prisma client and calls `seedBaseData` |
| `prisma/seed-data.ts` | Defines demo customer, demo accounts, ledger accounts, balances, credential, and role binding |

## Seeded Shape

| Area | Seed behavior |
|---|---|
| Customer | Upserts one demo customer with active status |
| Accounts | Upserts checking and savings accounts in USD |
| Ledger accounts | Creates customer ledger accounts plus cash, clearing, and interest revenue ledger accounts |
| Balances | Creates balance projections for checking and savings accounts |
| Auth | Creates a customer principal, password credential hash, and `CUSTOMER` role binding |

## Credential Note

`prisma/seed-data.ts` contains a demo-only secret value for local bootstrap and hashes it before storage. Do not reuse demo seed credentials for shared or deployed environments.

## Command

```powershell
npm run prisma:seed
```
