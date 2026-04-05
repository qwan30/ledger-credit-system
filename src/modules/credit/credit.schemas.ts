import { z } from "zod";

export const createCreditAssessmentSchema = z.object({
  customerId: z.string().uuid(),
  requestedBy: z.string().trim().min(1).max(120)
});

export const reviewCreditAssessmentSchema = z.object({
  reviewRationale: z.string().trim().min(1).max(500)
});

export type CreateCreditAssessmentRequest = z.infer<typeof createCreditAssessmentSchema>;
export type ReviewCreditAssessmentRequest = z.infer<typeof reviewCreditAssessmentSchema>;
