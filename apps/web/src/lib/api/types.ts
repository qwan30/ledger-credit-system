import type { paths } from "@ledger-credit-system/api-contracts";

export type LoginRequestBody =
  paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];

export type LoginResponseBody =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

export type TransferMutationResponse =
  paths["/transfers"]["post"]["responses"]["202"]["content"]["application/json"];

export type CreditAssessmentResponse =
  paths["/credit-assessments"]["post"]["responses"]["202"]["content"]["application/json"];
