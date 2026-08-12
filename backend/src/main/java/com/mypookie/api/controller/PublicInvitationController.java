package com.mypookie.api.controller;
import com.mypookie.api.repository.InvitationRepository; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/public/invitations") @RequiredArgsConstructor
public class PublicInvitationController {
 private final InvitationRepository invitations;
 @GetMapping("/{token}") public Object open(@PathVariable String token){return invitations.findByShareTokenAndStatus(token,"PUBLISHED").orElseThrow();}
}
