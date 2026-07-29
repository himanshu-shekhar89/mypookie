package com.mypookie.api.service;
import com.google.firebase.FirebaseApp; import com.google.firebase.auth.FirebaseAuth; import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.*; import jakarta.servlet.http.*; import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority; import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException; import java.util.List;
@Component @RequiredArgsConstructor
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
 private final ObjectProvider<FirebaseApp> firebaseApp;
 @Value("${app.auth.firebase-enabled:false}") boolean enabled;
 @Value("${app.auth.admin-emails:}") String adminEmails;
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
  String auth=req.getHeader("Authorization");
  try{
   if(enabled&&auth!=null&&auth.startsWith("Bearer ")){FirebaseToken token=FirebaseAuth.getInstance(firebaseApp.getObject()).verifyIdToken(auth.substring(7));authenticate(token.getUid(),token.getEmail(),Boolean.TRUE.equals(token.getClaims().get("admin"))||isAdminEmail(token.getEmail()));}
   else if(!enabled){String user=req.getHeader("X-Demo-User");if(user!=null&&!user.isBlank())authenticate(user,user+"@demo.mypookie.app","local-admin".equals(user)||"local-creator".equals(user));}
  }catch(Exception ignored){}
  chain.doFilter(req,res);
 }
 private boolean isAdminEmail(String email){if(email==null)return false;return List.of(adminEmails.split(",")).stream().map(String::trim).anyMatch(candidate->candidate.equalsIgnoreCase(email));}
 private void authenticate(String uid,String email,boolean admin){var principal=new UserPrincipal(uid,email,admin);var authorities=admin?List.of(new SimpleGrantedAuthority("ROLE_USER"),new SimpleGrantedAuthority("ROLE_ADMIN")):List.of(new SimpleGrantedAuthority("ROLE_USER"));SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal,null,authorities));}
 public record UserPrincipal(String uid,String email,boolean admin){}
}
