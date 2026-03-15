import { AppException } from "@/common/errors/app-exception";
import type { TransferStatus } from "@/common/domain/types";

const allowedTransitions: Record<TransferStatus, TransferStatus[]> = {
  RECEIVED: ["VALIDATED", "CANCELLED"],
  VALIDATED: ["PENDING_LEDGER", "CANCELLED"],
  PENDING_LEDGER: ["SETTLED", "PENDING_EXTERNAL", "FAILED"],
  PENDING_EXTERNAL: ["SETTLED", "FAILED"],
  SETTLED: [],
  FAILED: ["COMPENSATED"],
  COMPENSATED: [],
  CANCELLED: []
};

export function assertTransferTransition(current: TransferStatus, next: TransferStatus): void {
  const transitions = allowedTransitions[current] ?? [];

  if (!transitions.includes(next)) {
    throw new AppException(
      409,
      "invalid_transfer_state",
      `Transfer transition ${current} -> ${next} is not allowed.`
    );
  }
}
