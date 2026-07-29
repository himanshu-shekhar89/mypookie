package com.mypookie.api.controller;
import com.mypookie.api.dto.GiftRequest; import com.mypookie.api.model.Gift; import com.mypookie.api.repository.GiftRepository; import com.mypookie.api.service.*;
import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/gifts") @RequiredArgsConstructor
public class GiftController {
 private final GiftService service; private final GiftRepository gifts; private final UserService users;
 @GetMapping public List<Gift> mine(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p){return gifts.findBySenderIdOrderByUpdatedAtDesc(users.resolve(p).getId());}
 @PostMapping public Gift create(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p,@Valid @RequestBody GiftRequest r){return service.save(users.resolve(p).getId(),null,r);}
 @PutMapping("/{id}") public Gift update(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p,@PathVariable String id,@Valid @RequestBody GiftRequest r){return service.save(users.resolve(p).getId(),id,r);}
 @PostMapping("/{id}/publish") public Gift publish(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal p,@PathVariable String id){return service.publish(users.resolve(p).getId(),id);}
}
