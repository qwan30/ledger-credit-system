import { z } from "zod";

export const moneySchema = z.object({
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  minorUnits: z.number().int().safe()
});

export const internalDestinationSchema = z.object({
  type: z.literal("INTERNAL_ACCOUNT"),
  accountId: z.string().uuid()
});

export const externalDestinationSchema = z.object({
  type: z.literal("EXTERNAL_BANK"),
  bankCode: z.string().trim().min(2).max(32),
  accountNumber: z.string().trim().min(4).max(64),
  accountName: z.string().trim().min(1).max(200)
});

export const createTransferSchema = z.object({
  sourceAccountId: z.string().uuid(),
  destination: z.union([internalDestinationSchema, externalDestinationSchema]),
  amount: moneySchema,
  purpose: z.string().trim().max(200).optional()
});

export type CreateTransferRequest = z.infer<typeof createTransferSchema>;
