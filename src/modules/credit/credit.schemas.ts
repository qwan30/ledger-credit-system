import { z } from "zod";

export const createCreditAssessmentSchema = z.object({
  customerId: z.string().uuid(),
  requestedBy: z.string().trim().min(1).max(120)
});

export type CreateCreditAssessmentRequest = z.infer<typeof createCreditAssessmentSchema>;
