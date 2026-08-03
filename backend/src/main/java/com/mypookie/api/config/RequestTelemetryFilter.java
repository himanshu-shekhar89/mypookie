package com.mypookie.api.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class RequestTelemetryFilter extends OncePerRequestFilter {
 private static final Logger LOG=LoggerFactory.getLogger(RequestTelemetryFilter.class);
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException,IOException{
  String supplied=request.getHeader("X-Request-Id");
  String requestId=supplied!=null&&supplied.matches("^[A-Za-z0-9_-]{8,64}$")?supplied:UUID.randomUUID().toString();
  long started=System.nanoTime();
  MDC.put("requestId",requestId);response.setHeader("X-Request-Id",requestId);
  try{chain.doFilter(request,response);}
  finally{
   long durationMs=(System.nanoTime()-started)/1_000_000;
   LOG.info("http_request requestId={} method={} path={} status={} durationMs={}",requestId,request.getMethod(),request.getRequestURI(),response.getStatus(),durationMs);
   MDC.remove("requestId");
  }
 }
}
