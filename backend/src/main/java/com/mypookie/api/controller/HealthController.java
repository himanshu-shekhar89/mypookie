package com.mypookie.api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController @RequiredArgsConstructor
public class HealthController {
 private final JdbcTemplate database;
 @GetMapping("/api/health") public ResponseEntity<Map<String,Object>> health(){
  try{
   database.queryForObject("SELECT 1",Integer.class);
   return ResponseEntity.ok(Map.of("status","ok","service","mypookie.","database","ok","timestamp",Instant.now().toString()));
  }catch(Exception error){
   return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("status","unavailable","service","mypookie.","database","unavailable","timestamp",Instant.now().toString()));
  }
 }
}
