package com.mypookie.api.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayRepairConfig {
 @Bean
 FlywayMigrationStrategy repairThenMigrate(){
  return flyway->{flyway.repair();flyway.migrate();};
 }
}
