import { z } from "zod";

const roleSchema = z.string().trim().min(1).max(60).transform((value) => value.toUpperCase());
const actorTypeSchema = z.enum(["CUSTOMER", "OPS", "ANALYST", "AUDITOR", "ADMIN", "SYSTEM", "API_CLIENT"]);

const passwordLoginSchema = z.object({
  grantType: z.literal("password"),
  audience: z.string().trim().min(1),
  loginId: z.string().trim().min(1).max(120),
  secret: z.string().min(8).max(200)
});

const tokenExchangeSchema = z.object({
  grantType: z.literal("token-exchange"),
  audience: z.string().trim().min(1),
  subjectToken: z.string().trim().min(1)
});

export const authLoginSchema = z.discriminatedUnion("grantType", [passwordLoginSchema, tokenExchangeSchema]);

export const authRefreshSchema = z.object({
  refreshToken: z.string().trim().min(1)
});

export const authLogoutSchema = z.object({
  refreshToken: z.string().trim().min(1)
});

export const provisionPrincipalSchema = z
  .object({
    actorType: actorTypeSchema,
    actorId: z.string().trim().min(1).max(120),
    loginId: z.string().trim().min(1).max(120).optional(),
    customerId: z.string().uuid().optional(),
    roles: z.array(roleSchema).min(1).max(10)
  })
  .superRefine((value, ctx) => {
    if (value.actorType === "CUSTOMER") {
      if (!value.customerId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customerId"],
          message: "customerId is required when provisioning a customer principal."
        });
      }

      if (value.customerId && value.customerId !== value.actorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["actorId"],
          message: "Customer actorId must match customerId."
        });
      }
    }

    if (value.actorType !== "CUSTOMER" && value.customerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customerId"],
        message: "customerId may only be provided for customer principals."
      });
    }
  });

export const provisionRoleBindingSchema = z.object({
  principalId: z.string().uuid(),
  role: roleSchema
});

export const mapExternalIdentitySchema = z.object({
  principalId: z.string().uuid(),
  issuer: z.string().trim().url(),
  subject: z.string().trim().min(1).max(255)
});

export type AuthLoginRequest = z.infer<typeof authLoginSchema>;
export type AuthRefreshRequest = z.infer<typeof authRefreshSchema>;
export type AuthLogoutRequest = z.infer<typeof authLogoutSchema>;
export type ProvisionPrincipalRequest = z.infer<typeof provisionPrincipalSchema>;
export type ProvisionRoleBindingRequest = z.infer<typeof provisionRoleBindingSchema>;
export type MapExternalIdentityRequest = z.infer<typeof mapExternalIdentitySchema>;
