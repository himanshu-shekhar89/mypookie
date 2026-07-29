package com.mypookie.api.service;
import com.google.firebase.auth.FirebaseAuth; import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.*; import jakarta.servlet.http.*; import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.List;
@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
 @Value("${app.auth.firebase-enabled:false}") boolean enabled;
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String auth=req.getHeader("Authorization");
  try{
   if(enabled&&auth!=null&&auth.startsWith("Bearer ")){FirebaseToken token=FirebaseAuth.getInstance().verifyIdToken(auth.substring(7));authenticate(token.getUid(),token.getEmail());}
   else if(!enabled){String user=req.getHeader("X-Demo-User");if(user!=null&&!user.isBlank())authenticate(user,user+"@demo.mypookie.app");}
  }catch(Exception ignored){}
  chain.doFilter(req,res);
 }
 private void authenticate(String uid,String email){var principal=new UserPrincipal(uid,email);SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal,null,List.of(new SimpleGrantedAuthority("ROLE_USER"))));}
 public record UserPrincipal(String uid,String email){}
}
