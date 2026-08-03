package com.mypookie.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RateLimitFilterTest {
 @Test void throttlesRepeatedPinAttemptsFromOneClient() throws Exception{
  RateLimitFilter filter=new RateLimitFilter();
  for(int attempt=1;attempt<=21;attempt++){
   MockHttpServletRequest request=new MockHttpServletRequest("POST","/api/public/gifts/token/unlock");
   request.setRemoteAddr("203.0.113.10");
   MockHttpServletResponse response=new MockHttpServletResponse();
   filter.doFilter(request,response,(ignoredRequest,ignoredResponse)->{});
   assertEquals(attempt<=20?200:429,response.getStatus());
  }
 }
}
