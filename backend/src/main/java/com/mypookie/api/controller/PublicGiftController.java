package com.mypookie.api.controller;
import com.mypookie.api.repository.GiftRepository; import com.mypookie.api.service.GiftSecretService; import com.mypookie.api.service.RecipientSessionService; import com.mypookie.api.service.GiftOpenService; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*; import java.time.Instant; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import org.springframework.http.*; import org.springframework.web.server.ResponseStatusException; import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@RestController @RequestMapping("/api/public/gifts") @RequiredArgsConstructor
public class PublicGiftController {
 private final GiftRepository gifts;
 private final GiftSecretService secrets;
 private final RecipientSessionService recipientSessions;
 private final GiftOpenService giftOpens;
 private static final BCryptPasswordEncoder PINS=new BCryptPasswordEncoder(12);
 public record PublicGiftResponse(String id,String senderName,String recipientName,String theme,String ambience,String blocksJson,Instant scheduledAt,boolean requiresPin,boolean accessGranted,int opensRemaining,String recipientSession){}
 public record UnlockRequest(@NotBlank @Pattern(regexp="^\\d{4,8}$") String pin){}
 public record ProgressRequest(@Min(1) int stage,@Min(1) int totalStages){}
 @GetMapping("/{token}") public PublicGiftResponse open(@PathVariable String token,@RequestHeader(value="X-Gift-Open-Id",required=false) String openId){
  var gift=gifts.findByShareToken(token).filter(g->g.getStatus().equals("PUBLISHED")).orElseThrow();
  if(gift.getAccessPinHash()!=null&&!gift.getAccessPinHash().isBlank())return response(gift,false,false);
  return grant(gift,openId);
 }
 @PostMapping("/{token}/unlock") public PublicGiftResponse unlock(@PathVariable String token,@RequestHeader(value="X-Gift-Open-Id",required=false) String openId,@Valid @RequestBody UnlockRequest request){
  var gift=gifts.findByShareToken(token).filter(g->g.getStatus().equals("PUBLISHED")).orElseThrow();
  if(gift.getAccessPinHash()==null||gift.getAccessPinHash().isBlank())return grant(gift,openId);
  if(!PINS.matches(request.pin(),gift.getAccessPinHash()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Incorrect gift PIN");
  return grant(gift,openId);
 }
 private PublicGiftResponse grant(com.mypookie.api.model.Gift gift,String openId){
  boolean unlocked=gift.getScheduledAt()==null||!gift.getScheduledAt().isAfter(Instant.now());
  if(unlocked)gift=giftOpens.register(gift.getId(),openId);
  String blocks=unlocked?secrets.reveal(gift.getId(),gift.getBlocksJson()):gift.getBlocksJson();
  return response(gift,true,unlocked,blocks,recipientSessions.issue(gift.getId()));
 }
 private PublicGiftResponse response(com.mypookie.api.model.Gift gift,boolean granted,boolean unlocked){return response(gift,granted,unlocked,"[]");}
 private PublicGiftResponse response(com.mypookie.api.model.Gift gift,boolean granted,boolean unlocked,String blocks){return response(gift,granted,unlocked,blocks,null);}
 private PublicGiftResponse response(com.mypookie.api.model.Gift gift,boolean granted,boolean unlocked,String blocks,String session){int remaining=gift.getMaxOpenCount()==0?-1:Math.max(0,gift.getMaxOpenCount()-gift.getOpenCount());return new PublicGiftResponse(gift.getId(),gift.getSenderName(),gift.getRecipientName(),gift.getTheme(),gift.getAmbience(),blocks,gift.getScheduledAt(),gift.getAccessPinHash()!=null&&!gift.getAccessPinHash().isBlank(),granted,remaining,session);}
 @PostMapping("/{token}/progress") public void progress(@PathVariable String token,@RequestHeader(value=RecipientSessionService.HEADER,required=false) String session,@Valid @RequestBody ProgressRequest request){var gift=gifts.findByShareToken(token).filter(g->g.getStatus().equals("PUBLISHED")).orElseThrow();recipientSessions.require(gift.getId(),session);gift.setTotalSteps(Math.max(gift.getTotalSteps(),request.totalStages()));gift.setCurrentStep(Math.max(gift.getCurrentStep(),Math.min(request.stage(),request.totalStages())));gifts.save(gift);}
 @PostMapping("/{token}/complete") public void complete(@PathVariable String token,@RequestHeader(value=RecipientSessionService.HEADER,required=false) String session){
  var gift=gifts.findByShareToken(token).filter(g->g.getStatus().equals("PUBLISHED")).orElseThrow();
  recipientSessions.require(gift.getId(),session);
  if(gift.getOpenedAt()==null)gift.setOpenedAt(Instant.now());
  gift.setCurrentStep(Math.max(gift.getCurrentStep(),gift.getTotalSteps()));
  if(gift.getCompletedAt()==null)gift.setCompletedAt(Instant.now());
  gifts.save(gift);
 }
}
