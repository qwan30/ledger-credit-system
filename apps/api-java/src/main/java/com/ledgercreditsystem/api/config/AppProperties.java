package com.ledgercreditsystem.api.config;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
    @NotBlank String apiBasePath,
    @NotBlank String docsPath,
    @NotEmpty List<@Pattern(regexp = "^[A-Z]{3}$") String> supportedCurrencies,
    @NotBlank String businessTimezone,
    @Valid RateLimitProperties rateLimit,
    @Valid AuthProperties auth,
    @Valid BatchProperties batch,
    @Valid ExternalRailProperties externalRail) {

  public record RateLimitProperties(
      @Min(1) int max,
      @Min(1) int windowMs) {}

  public record AuthProperties(
      @NotBlank String internalIssuer,
      @NotBlank String customerAudience,
      @NotBlank String operatorAudience,
      @NotBlank String jwtSecret) {}

  public record BatchProperties(
      @NotBlank String closeWindowCron,
      @Min(1) int shardSize,
      @Min(1) int workerConcurrency) {}

  public record ExternalRailProperties(
      @NotBlank String defaultProvider,
      @NotBlank String callbackSecret) {}
}
