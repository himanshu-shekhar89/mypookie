package com.mypookie.api.controller;
import com.mypookie.api.dto.AuthRequest; import com.mypookie.api.model.AppUser; import com.mypookie.api.repository.AppUserRepository;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*; import java.util.UUID;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
 private final AppUserRepository users;
 @PostMapping("/session") public AppUser session(@Valid @RequestBody AuthRequest r){return users.findByFirebaseUid(r.firebaseUid()).orElseGet(()->{var u=new AppUser();u.setId(UUID.randomUUID().toString());u.setFirebaseUid(r.firebaseUid());u.setEmail(r.email());u.setDisplayName(r.displayName());return users.save(u);});}
}
