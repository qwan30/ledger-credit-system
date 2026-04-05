package com.ledgercreditsystem.api.health;

import com.ledgercreditsystem.api.common.api.StatusEnvelope;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

  @GetMapping("/live")
  public StatusEnvelope live() {
    return StatusEnvelope.ok("ok");
  }

  @GetMapping("/ready")
  public StatusEnvelope ready() {
    return StatusEnvelope.ok("ready");
  }
}
