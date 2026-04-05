import { AppConfigService } from "@/common/config/app-config.service";
import { createApp } from "@/bootstrap";

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const config = app.get(AppConfigService);

  await app.listen(config.port, "0.0.0.0");
}

void bootstrap();
