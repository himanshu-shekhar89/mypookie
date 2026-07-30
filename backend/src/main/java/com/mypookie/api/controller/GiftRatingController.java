package com.mypookie.api.controller;

import com.mypookie.api.model.GiftRating;
import com.mypookie.api.repository.GiftRatingRepository;
import com.mypookie.api.repository.GiftRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/gifts/{giftId}/rating")
@RequiredArgsConstructor
public class GiftRatingController {
 private final GiftRepository gifts;
 private final GiftRatingRepository ratings;
 public record RatingRequest(@Min(1) @Max(5) int stars,@Size(max=500) String comment){}
 public record RatingResult(int stars,String message){}

 @PostMapping
 public RatingResult save(@PathVariable String giftId,@Valid @RequestBody RatingRequest request){
  gifts.findById(giftId).filter(gift->"PUBLISHED".equals(gift.getStatus())).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  var rating=ratings.findByGiftId(giftId).orElseGet(()->{var value=new GiftRating();value.setId(UUID.randomUUID().toString());value.setGiftId(giftId);return value;});
  rating.setStars(request.stars());
  rating.setComment(request.comment()==null?"":request.comment().trim());
  rating.setUpdatedAt(Instant.now());
  ratings.save(rating);
  return new RatingResult(rating.getStars(),"Thank you for sharing how it felt.");
 }
}
