package com.mypookie.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mypookie.api.dto.ContributionSubmitRequest;
import com.mypookie.api.model.*;
import com.mypookie.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ContributionInviteService {
 private static final Duration CLAIM_WINDOW=Duration.ofMinutes(30);
 private final ContributionInviteRepository invites;
 private final ContributionClaimRepository claims;
 private final GiftRepository gifts;
 private final ExperienceResponseRepository responses;
 private final ObjectMapper json;

 public ContributionInvite issue(String giftId){
  var current=invites.findByGiftIdAndStatusOrderByCreatedAtDesc(giftId,"ACTIVE").stream()
   .filter(item->item.getExpiresAt().isAfter(Instant.now())).findFirst();
  if(current.isPresent())return current.get();
  var invite=new ContributionInvite();
  invite.setId(UUID.randomUUID().toString());
  invite.setGiftId(giftId);
  invite.setToken(randomToken());
  invite.setStatus("ACTIVE");
  invite.setExpiresAt(Instant.now().plus(Duration.ofDays(30)));
  return invites.save(invite);
 }

 @Transactional
 public ClaimResult claim(String token,String presentedClaim){
  var invite=locked(token);
  var now=Instant.now();
  expireIfNeeded(invite,now);
  if(!"ACTIVE".equals(invite.getStatus()))throw gone("This contribution room has expired.");
  ContributionClaim claim=null;
  if(presentedClaim!=null)claim=claims.findByClaimTokenForUpdate(presentedClaim).orElse(null);
  if(claim==null||!Objects.equals(claim.getInviteId(),invite.getId())||!"ACTIVE".equals(claim.getStatus())||claim.getExpiresAt().isBefore(now)){
   claim=new ContributionClaim();
   claim.setId(UUID.randomUUID().toString());
   claim.setInviteId(invite.getId());
   claim.setClaimToken(randomToken());
   claim.setStatus("ACTIVE");
   claim.setExpiresAt(now.plus(CLAIM_WINDOW));
   claims.save(claim);
  }
  var gift=gifts.findById(invite.getGiftId()).orElseThrow();
  return new ClaimResult(gift.getRecipientName(),gift.getOccasion(),claim.getClaimToken(),claim.getExpiresAt());
 }

 @Transactional
 public void submit(String token,ContributionSubmitRequest request){
  var invite=locked(token);
  var now=Instant.now();
  expireIfNeeded(invite,now);
  if(!"ACTIVE".equals(invite.getStatus()))throw gone("This contribution room is no longer active.");
  var claim=claims.findByClaimTokenForUpdate(request.claimToken()).orElseThrow(()->gone("This contribution session is no longer active."));
  if(!Objects.equals(claim.getInviteId(),invite.getId())||!"ACTIVE".equals(claim.getStatus())||claim.getExpiresAt().isBefore(now))throw gone("You have already submitted from this link, or this session expired.");
  try{
   var response=new ExperienceResponse();
   response.setId(UUID.randomUUID().toString());
   response.setGiftId(invite.getGiftId());
   response.setBlockId("groupboard");
   response.setResponseType("GROUP_MESSAGE");
   response.setContributorName(request.contributorName().trim());
   response.setResponseText(request.responseText().trim());
   response.setPhotoUrls(json.writeValueAsString(request.photoUrls()==null?List.of():request.photoUrls()));
   responses.save(response);
   claim.setStatus("USED");
   claim.setUsedAt(now);
  }catch(Exception error){
   throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The contribution could not be saved.",error);
  }
 }

 private ContributionInvite locked(String token){
  return invites.findByTokenForUpdate(token).orElseThrow(()->gone("This contribution link is invalid."));
 }

 private void expireIfNeeded(ContributionInvite invite,Instant now){
  if(invite.getExpiresAt().isBefore(now))invite.setStatus("EXPIRED");
 }

 private String randomToken(){return UUID.randomUUID().toString().replace("-","")+UUID.randomUUID().toString().replace("-","");}
 private ResponseStatusException gone(String message){return new ResponseStatusException(HttpStatus.GONE,message);}
 public record ClaimResult(String recipientName,String occasion,String claimToken,Instant claimExpiresAt){}
}
