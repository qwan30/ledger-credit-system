package com.ledgercreditsystem.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ApiJavaApplication {

  public static void main(String[] args) {
    SpringApplication.run(ApiJavaApplication.class, args);
  }

}
