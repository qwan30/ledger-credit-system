import { Inject, Injectable } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { AppConfigService } from "@/common/config/app-config.service";
import { AppException } from "@/common/errors/app-exception";

export interface ExternalIdentitySubject {
  issuer: string;
  subject: string;
}

@Injectable()
export class OidcIdentityVerifier {
  private remoteJwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(@Inject(AppConfigService) private readonly config: AppConfigService) {}

  async verifySubjectToken(subjectToken: string): Promise<ExternalIdentitySubject> {
    if (!this.config.authOidcIssuer || !this.config.authOidcJwksUri || !this.config.authOidcAudience) {
      throw new AppException(503, "oidc_not_configured", "Operator identity provider is not configured.");
    }

    this.remoteJwks ??= createRemoteJWKSet(new URL(this.config.authOidcJwksUri));

    try {
      const { payload } = await jwtVerify(subjectToken, this.remoteJwks, {
        issuer: this.config.authOidcIssuer,
        audience: this.config.authOidcAudience
      });

      if (typeof payload.sub !== "string" || typeof payload.iss !== "string") {
        throw new AppException(401, "invalid_subject_token", "Subject token is missing required claims.");
      }

      return {
        issuer: payload.iss,
        subject: payload.sub
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(401, "invalid_subject_token", "Subject token is invalid or expired.");
    }
  }
}
