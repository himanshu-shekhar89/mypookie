package com.mypookie.api.controller;
import com.mypookie.api.repository.GiftRepository; import com.mypookie.api.service.GiftSecretService; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*; import java.time.Instant;
@RestController @RequestMapping("/api/public/gifts") @RequiredArgsConstructor
public class PublicGiftController {
 private final GiftRepository gifts;
 private final GiftSecretService secrets;
 public record PublicGiftResponse(String id,String senderName,String recipientName,String theme,String ambience,String blocksJson,Instant scheduledAt){}
 @GetMapping("/{token}") public PublicGiftResponse open(@PathVariable String token){
  var gift=gifts.findByShareToken(token).filter(g->g.getStatus().equals("PUBLISHED")).orElseThrow();
  boolean unlocked=gift.getScheduledAt()==null||!gift.getScheduledAt().isAfter(Instant.now());
  String blocks=unlocked?secrets.reveal(gift.getId(),gift.getBlocksJson()):gift.getBlocksJson();
  return new PublicGiftResponse(gift.getId(),gift.getSenderName(),gift.getRecipientName(),gift.getTheme(),gift.getAmbience(),blocks,gift.getScheduledAt());
 }
}
