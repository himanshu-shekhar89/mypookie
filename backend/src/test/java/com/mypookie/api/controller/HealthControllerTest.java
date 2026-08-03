package com.mypookie.api.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class HealthControllerTest {
 @Test void reportsReadyOnlyWhenTheDatabaseAnswers(){
  JdbcTemplate database=mock(JdbcTemplate.class);
  when(database.queryForObject("SELECT 1",Integer.class)).thenReturn(1);
  assertEquals(HttpStatus.OK,new HealthController(database).health().getStatusCode());
 }

 @Test void reportsUnavailableWhenTheDatabaseCannotAnswer(){
  JdbcTemplate database=mock(JdbcTemplate.class);
  when(database.queryForObject("SELECT 1",Integer.class)).thenThrow(new IllegalStateException("database unavailable"));
  assertEquals(HttpStatus.SERVICE_UNAVAILABLE,new HealthController(database).health().getStatusCode());
 }
}
