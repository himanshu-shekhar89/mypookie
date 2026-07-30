package com.mypookie.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class RateLimitFilter extends OncePerRequestFilter {
 private final Map<String,Window> windows=new HashMap<>();
 private record Rule(String name,int limit,long seconds){}
 private record Window(long startedAt,int count){}

 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  Rule rule=rule(request);
  if(rule!=null&&!allow(clientIp(request)+":"+rule.name(),rule)){
   response.setStatus(429);
   response.setContentType("application/json");
   response.setHeader("Retry-After",String.valueOf(rule.seconds()));
   response.getWriter().write("{\"error\":\"Too many requests. Please wait a little and try again.\"}");
   return;
  }
  chain.doFilter(request,response);
 }

 private Rule rule(HttpServletRequest request){
  if(!"POST".equalsIgnoreCase(request.getMethod()))return null;
  String path=request.getRequestURI();
  if(path.startsWith("/api/ai/"))return new Rule("ai",20,60);
  if(path.endsWith("/compatibility-report"))return new Rule("report",8,60);
  if(path.contains("/contributions/"))return new Rule("contribution",20,60);
  if(path.endsWith("/rating"))return new Rule("rating",8,60);
  if(path.startsWith("/api/public/gifts/")&&path.endsWith("/responses"))return new Rule("response",35,60);
  if(path.startsWith("/api/media/"))return new Rule("media",12,300);
  return null;
 }

 private synchronized boolean allow(String key,Rule rule){
  long now=Instant.now().getEpochSecond();
  Window current=windows.get(key);
  if(current==null||now-current.startedAt()>=rule.seconds()){
   windows.put(key,new Window(now,1));
   if(windows.size()>10_000)windows.entrySet().removeIf(entry->now-entry.getValue().startedAt()>600);
   return true;
  }
  if(current.count()>=rule.limit())return false;
  windows.put(key,new Window(current.startedAt(),current.count()+1));
  return true;
 }

 private String clientIp(HttpServletRequest request){
  String forwarded=request.getHeader("X-Forwarded-For");
  if(forwarded!=null&&!forwarded.isBlank())return forwarded.split(",")[0].trim();
  return request.getRemoteAddr();
 }
}
