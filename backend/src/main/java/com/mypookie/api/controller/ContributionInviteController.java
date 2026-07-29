package com.mypookie.api.controller;

import com.mypookie.api.dto.*;
import com.mypookie.api.repository.GiftRepository;
import com.mypookie.api.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

@RestController
@RequiredArgsConstructor
public class ContributionInviteController {
 private final GiftRepository gifts;
 private final UserService users;
 private final ContributionInviteService invites;

 @PostMapping("/api/gifts/{giftId}/contribution-invites")
 public InviteResult create(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@PathVariable String giftId){
  var user=users.resolve(principal);
  var gift=gifts.findById(giftId).orElseThrow();
  if(!gift.getSenderId().equals(user.getId()))throw new SecurityException("Not your gift");
  var invite=invites.issue(giftId);
  return new InviteResult(invite.getToken(),invite.getExpiresAt());
 }

 @PostMapping("/api/public/contributions/{token}/claim")
 public ContributionInviteService.ClaimResult claim(@PathVariable String token,@RequestBody(required=false) ContributionClaimRequest request){
  return invites.claim(token,request==null?null:request.claimToken());
 }

 @PostMapping("/api/public/contributions/{token}/submit")
 public void submit(@PathVariable String token,@Valid @RequestBody ContributionSubmitRequest request){
  invites.submit(token,request);
 }

 public record InviteResult(String token,Instant expiresAt){}
}
