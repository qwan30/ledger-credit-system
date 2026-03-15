export type ActorType = "CUSTOMER" | "OPS" | "ANALYST" | "AUDITOR" | "ADMIN" | "SYSTEM" | "API_CLIENT";

export type TransferStatus =
  | "RECEIVED"
  | "VALIDATED"
  | "PENDING_LEDGER"
  | "PENDING_EXTERNAL"
  | "SETTLED"
  | "FAILED"
  | "COMPENSATED"
  | "CANCELLED";
