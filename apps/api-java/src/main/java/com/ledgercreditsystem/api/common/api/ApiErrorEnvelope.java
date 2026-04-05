package com.ledgercreditsystem.api.common.api;

import java.util.List;

public record ApiErrorEnvelope(ApiErrorBody error) {

  public static ApiErrorEnvelope of(String code, String message) {
    return new ApiErrorEnvelope(new ApiErrorBody(code, message, List.of()));
  }

  public static ApiErrorEnvelope of(String code, String message, List<ApiFieldError> details) {
    return new ApiErrorEnvelope(new ApiErrorBody(code, message, details));
  }

  public record ApiErrorBody(String code, String message, List<ApiFieldError> details) {}

  public record ApiFieldError(String field, String message) {}
}
