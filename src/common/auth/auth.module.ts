import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";

import { AuthGuard } from "@/common/auth/auth.guard";
import { RolesGuard } from "@/common/auth/roles.guard";
import { AppConfigService } from "@/common/config/app-config.service";

@Global()
@Module({
  imports: [
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
  exports: [JwtModule]
})
export class AuthModule {}
