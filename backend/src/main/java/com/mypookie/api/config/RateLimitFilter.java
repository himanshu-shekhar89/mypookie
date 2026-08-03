package com.mypookie.api.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
 private record Window(long startedAt,int count){}
 private record Rule(String name,int requests,long seconds){}
 private final ConcurrentHashMap<String,Window> windows=new ConcurrentHashMap<>();

 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException,IOException{
  Rule rule=rule(request);
  if(rule==null){chain.doFilter(request,response);return;}
  long now=Instant.now().getEpochSecond();
  String key=rule.name()+":"+clientIp(request);
  Window window=windows.compute(key,(ignored,current)->current==null||now-current.startedAt()>=rule.seconds()?new Window(now,1):new Window(current.startedAt(),current.count()+1));
  long retryAfter=Math.max(1,rule.seconds()-(now-window.startedAt()));
  response.setHeader("X-RateLimit-Limit",String.valueOf(rule.requests()));
  response.setHeader("X-RateLimit-Remaining",String.valueOf(Math.max(0,rule.requests()-window.count())));
  if(window.count()>rule.requests()){
   response.setStatus(429);response.setHeader("Retry-After",String.valueOf(retryAfter));response.setContentType(MediaType.APPLICATION_JSON_VALUE);
   response.getWriter().write("{\"error\":\"Too many requests. Please wait and try again.\"}");return;
  }
  if(windows.size()>20_000)windows.entrySet().removeIf(entry->now-entry.getValue().startedAt()>3600);
  chain.doFilter(request,response);
 }

 private Rule rule(HttpServletRequest request){
  String path=request.getRequestURI();
  if(path.matches("/api/public/gifts/[^/]+/unlock"))return new Rule("gift-unlock",20,600);
  if(path.startsWith("/api/public/"))return new Rule("public-api",180,60);
  if(path.startsWith("/api/ai/"))return new Rule("ai",30,60);
  if(path.startsWith("/api/media/"))return new Rule("media",30,3600);
  if(path.startsWith("/api/auth/"))return new Rule("auth",60,600);
  if(path.startsWith("/api/orders")&& !"GET".equals(request.getMethod()))return new Rule("orders",60,600);
  return null;
 }
 private String clientIp(HttpServletRequest request){
  String forwarded=request.getHeader("X-Forwarded-For");
  if(forwarded!=null&&!forwarded.isBlank())return forwarded.split(",")[0].trim();
  return request.getRemoteAddr();
 }
}
