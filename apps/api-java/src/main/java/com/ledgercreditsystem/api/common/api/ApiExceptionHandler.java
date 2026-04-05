package com.ledgercreditsystem.api.common.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorEnvelope> handleValidation(MethodArgumentNotValidException exception) {
    List<ApiErrorEnvelope.ApiFieldError> details = exception.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(this::toFieldError)
        .toList();

    return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
        .body(ApiErrorEnvelope.of("validation_error", "Request validation failed", details));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorEnvelope> handleUnexpected(Exception exception) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiErrorEnvelope.of("internal_error", "Internal server error."));
  }

  private ApiErrorEnvelope.ApiFieldError toFieldError(FieldError error) {
    String field = error.getField();
    String message = error.getDefaultMessage() == null ? "Invalid value." : error.getDefaultMessage();
    return new ApiErrorEnvelope.ApiFieldError(field, message);
  }
}
