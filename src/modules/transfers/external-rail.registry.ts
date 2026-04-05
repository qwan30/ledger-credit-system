import { Inject, Injectable } from "@nestjs/common";

import { AppException } from "@/common/errors/app-exception";
import type { ExternalRailAdapter } from "@/modules/transfers/external-rail.adapter";
import { ExternalRailMockBankService } from "@/modules/transfers/external-rail-mock-bank.service";
import { ExternalRailSimulatorService } from "@/modules/transfers/external-rail-simulator.service";

@Injectable()
export class ExternalRailRegistry {
  private readonly adapters: Map<string, ExternalRailAdapter>;

  constructor(
    @Inject(ExternalRailSimulatorService)
    externalRailSimulatorService: ExternalRailSimulatorService,
    @Inject(ExternalRailMockBankService)
    externalRailMockBankService: ExternalRailMockBankService
  ) {
    this.adapters = new Map(
      [externalRailSimulatorService, externalRailMockBankService].map((adapter) => [adapter.provider, adapter])
    );
  }

  get(provider: string) {
    const adapter = this.adapters.get(provider);

    if (adapter) {
      return adapter;
    }

    throw new AppException(422, "external_rail_provider_not_supported", `Unsupported external rail provider ${provider}.`);
  }
}
