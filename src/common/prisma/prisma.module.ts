import { Global, Module } from "@nestjs/common";

import { AppConfigModule } from "@/common/config/app-config.module";
import { PrismaService } from "@/common/prisma/prisma.service";

@Global()
@Module({
  imports: [AppConfigModule],
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
