import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";

import { AuthGuard } from "@/common/auth/auth.guard";
import { AuthIdentityService } from "@/common/auth/auth-identity.service";
import { OidcIdentityVerifier } from "@/common/auth/oidc-identity-verifier";
import { PasswordHasher } from "@/common/auth/password-hasher";
import { RolesGuard } from "@/common/auth/roles.guard";
import { AppConfigModule } from "@/common/config/app-config.module";
import { AppConfigService } from "@/common/config/app-config.service";
import { PrismaModule } from "@/common/prisma/prisma.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { AuthController } from "@/modules/auth/auth.controller";
import { AuthProvisioningService } from "@/modules/auth/auth-provisioning.service";

@Global()
@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    AuditModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {
          algorithm: "HS256"
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    PasswordHasher,
    OidcIdentityVerifier,
    AuthIdentityService,
    AuthProvisioningService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
  exports: [JwtModule, PasswordHasher, OidcIdentityVerifier, AuthIdentityService, AuthProvisioningService]
})
export class AuthModule {}
