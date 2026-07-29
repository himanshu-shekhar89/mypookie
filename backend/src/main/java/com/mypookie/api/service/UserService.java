package com.mypookie.api.service;
import com.mypookie.api.model.AppUser; import com.mypookie.api.repository.AppUserRepository;
import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import java.util.UUID;
@Service @RequiredArgsConstructor
public class UserService {
 private final AppUserRepository users;
 public AppUser resolve(FirebaseAuthenticationFilter.UserPrincipal p){
  var user=users.findByFirebaseUid(p.uid()).orElseGet(()->{var u=new AppUser();u.setId(UUID.randomUUID().toString());u.setFirebaseUid(p.uid());u.setEmail(p.email());u.setDisplayName(p.email().split("@")[0]);return u;});
  user.setEmail(p.email());
  if(p.admin())user.setRole("ADMIN");
  return users.save(user);
 }
}
