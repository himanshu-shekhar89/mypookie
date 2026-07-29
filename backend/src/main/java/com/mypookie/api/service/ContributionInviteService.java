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
 private final GiftRepository gifts;
 private final ExperienceResponseRepository responses;
 private final ObjectMapper json;

 public ContributionInvite issue(String giftId){
  var invite=new ContributionInvite();
  invite.setId(UUID.randomUUID().toString());
  invite.setGiftId(giftId);
  invite.setToken(randomToken());
  invite.setStatus("CREATED");
  invite.setExpiresAt(Instant.now().plus(Duration.ofDays(7)));
  return invites.save(invite);
 }

 @Transactional
 public ClaimResult claim(String token,String presentedClaim){
  var invite=locked(token);
  var now=Instant.now();
  expireIfNeeded(invite,now);
  if("USED".equals(invite.getStatus())||"EXPIRED".equals(invite.getStatus()))throw gone("This contribution link has expired.");
  if("CREATED".equals(invite.getStatus())){
   invite.setStatus("CLAIMED");
   invite.setClaimToken(randomToken());
   invite.setClaimedAt(now);
  }else if(!Objects.equals(invite.getClaimToken(),presentedClaim)){
   throw gone("This one-time contribution link has already been opened.");
  }
  var gift=gifts.findById(invite.getGiftId()).orElseThrow();
  return new ClaimResult(gift.getRecipientName(),gift.getOccasion(),invite.getClaimToken(),invite.getClaimedAt().plus(CLAIM_WINDOW));
 }

 @Transactional
 public void submit(String token,ContributionSubmitRequest request){
  var invite=locked(token);
  var now=Instant.now();
  expireIfNeeded(invite,now);
  if(!"CLAIMED".equals(invite.getStatus())||!Objects.equals(invite.getClaimToken(),request.claimToken()))throw gone("This contribution link is no longer active.");
  if(invite.getClaimedAt().plus(CLAIM_WINDOW).isBefore(now)){
   invite.setStatus("EXPIRED");
   throw gone("This contribution session expired. Ask the sender for a fresh link.");
  }
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
   invite.setStatus("USED");
   invite.setUsedAt(now);
   invite.setClaimToken(null);
  }catch(Exception error){
   throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The contribution could not be saved.",error);
  }
 }

 private ContributionInvite locked(String token){
  return invites.findByTokenForUpdate(token).orElseThrow(()->gone("This contribution link is invalid."));
 }

 private void expireIfNeeded(ContributionInvite invite,Instant now){
  if(invite.getExpiresAt().isBefore(now)||("CLAIMED".equals(invite.getStatus())&&invite.getClaimedAt().plus(CLAIM_WINDOW).isBefore(now)))invite.setStatus("EXPIRED");
 }

 private String randomToken(){return UUID.randomUUID().toString().replace("-","")+UUID.randomUUID().toString().replace("-","");}
 private ResponseStatusException gone(String message){return new ResponseStatusException(HttpStatus.GONE,message);}
 public record ClaimResult(String recipientName,String occasion,String claimToken,Instant claimExpiresAt){}
}
