package com.mypookie.api.config;
import com.mypookie.api.service.FirebaseAuthenticationFilter;
import lombok.RequiredArgsConstructor; import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*; import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain; import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*; import java.util.List;
@Configuration @RequiredArgsConstructor
public class SecurityConfig {
 private final FirebaseAuthenticationFilter firebaseFilter;
 @Value("${app.frontend-url}") private String frontendUrl;
 @Bean SecurityFilterChain security(HttpSecurity http) throws Exception {
  return http.csrf(c->c.disable()).cors(c->c.configurationSource(cors()))
   .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers("/error","/api/health","/api/catalog/**","/api/public/**","/api/ai/**").permitAll().requestMatchers("/api/admin/**").hasRole("ADMIN").anyRequest().authenticated())
   .addFilterBefore(firebaseFilter, UsernamePasswordAuthenticationFilter.class).build();
 }
 @Bean CorsConfigurationSource cors(){var c=new CorsConfiguration();c.setAllowedOriginPatterns(List.of(frontendUrl,"https://*.chatgpt.site","http://localhost:*"));c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("*"));c.setAllowCredentials(true);var s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/**",c);return s;}
}
