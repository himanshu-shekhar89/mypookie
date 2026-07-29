package com.mypookie.api.controller;
import com.mypookie.api.model.AppUser; import com.mypookie.api.service.*;
import lombok.RequiredArgsConstructor; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
 private final UserService users;
 @PostMapping("/session") public AppUser session(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal){return users.resolve(principal);}
}
