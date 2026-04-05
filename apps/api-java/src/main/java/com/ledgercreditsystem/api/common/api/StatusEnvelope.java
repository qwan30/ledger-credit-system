package com.ledgercreditsystem.api.common.api;

public record StatusEnvelope(StatusData data) {

  public static StatusEnvelope ok(String status) {
    return new StatusEnvelope(new StatusData(status));
  }

  public record StatusData(String status) {}
}
