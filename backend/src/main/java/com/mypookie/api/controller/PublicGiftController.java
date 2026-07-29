package com.mypookie.api.controller;
import com.mypookie.api.model.Gift; import com.mypookie.api.repository.GiftRepository; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/public/gifts") @RequiredArgsConstructor
public class PublicGiftController {
 private final GiftRepository gifts;
 @GetMapping("/{token}") public Gift open(@PathVariable String token){return gifts.findByShareToken(token).filter(g->g.getStatus().equals("PUBLISHED")).orElseThrow();}
}
