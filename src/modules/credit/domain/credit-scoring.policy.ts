import { AppException } from "@/common/errors/app-exception";

export interface CreditProfileInput {
  paymentHistoryPoints: number;
  averageBalanceMinor: bigint;
  transactionFrequency: number;
}

export interface CreditDecision {
  score: number;
  status: "APPROVED" | "REJECTED";
  rationaleSummary: string;
}

export interface CreditPolicyConfig {
  approveThreshold: number;
  rejectThreshold: number;
}

const BASE_SCORE = 300;
const MAX_DELTA = 550;

export function computeCreditDecision(
  input: CreditProfileInput,
  policy: CreditPolicyConfig
): CreditDecision {
  if (policy.approveThreshold <= policy.rejectThreshold) {
    throw new AppException(500, "invalid_credit_policy", "Approve threshold must be greater than reject threshold.");
  }

  const paymentComponent = Math.max(0, Math.min(220, input.paymentHistoryPoints));
  const balanceComponent = Number(input.averageBalanceMinor / 5_000n);
  const boundedBalanceComponent = Math.max(0, Math.min(180, balanceComponent));
  const activityComponent = Math.max(0, Math.min(150, input.transactionFrequency * 5));
  const score = Math.max(
    BASE_SCORE,
    Math.min(BASE_SCORE + MAX_DELTA, BASE_SCORE + paymentComponent + boundedBalanceComponent + activityComponent)
  );

  return {
    score,
    status: score >= policy.approveThreshold ? "APPROVED" : "REJECTED",
    rationaleSummary: `payment_history=${paymentComponent}; average_balance=${boundedBalanceComponent}; activity=${activityComponent}`
  };
}
