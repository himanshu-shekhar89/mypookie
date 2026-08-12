package com.mypookie.api.controller;
import com.mypookie.api.dto.InvitationRequest; import com.mypookie.api.model.Invitation; import com.mypookie.api.repository.InvitationRepository; import com.mypookie.api.service.*;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import org.springframework.web.server.ResponseStatusException; import java.time.Instant; import java.util.*;
@RestController @RequestMapping("/api/invitations") @RequiredArgsConstructor
public class InvitationController {
 private final InvitationRepository invitations; private final UserService users;
 @GetMapping public List<Invitation> mine(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p){return invitations.findByCreatorIdOrderByUpdatedAtDesc(users.resolve(p).getId());}
 @PostMapping public Invitation create(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p,@Valid @RequestBody InvitationRequest r){return save(users.resolve(p).getId(),null,r);}
 @PutMapping("/{id}") public Invitation update(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p,@PathVariable String id,@Valid @RequestBody InvitationRequest r){return save(users.resolve(p).getId(),id,r);}
 @PostMapping("/{id}/publish") public Invitation publish(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p,@PathVariable String id){var user=users.resolve(p);var invitation=owned(id,user.getId());if(invitation.getShareToken()==null)invitation.setShareToken(UUID.randomUUID().toString().replace("-","").substring(0,24));invitation.setStatus("PUBLISHED");invitation.setUpdatedAt(Instant.now());return invitations.save(invitation);}
 private Invitation save(String userId,String id,InvitationRequest r){var invitation=id==null?new Invitation():owned(id,userId);if(id==null){invitation.setId(UUID.randomUUID().toString());invitation.setCreatorId(userId);invitation.setStatus("DRAFT");}invitation.setTitle(r.title().trim());invitation.setTradition(r.tradition().trim().toUpperCase());invitation.setDetailsJson(r.detailsJson());invitation.setUpdatedAt(Instant.now());return invitations.save(invitation);}
 private Invitation owned(String id,String userId){return invitations.findById(id).filter(value->value.getCreatorId().equals(userId)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Invitation not found."));}
}
