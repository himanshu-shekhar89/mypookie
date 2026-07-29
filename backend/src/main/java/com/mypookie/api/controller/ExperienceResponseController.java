package com.mypookie.api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mypookie.api.dto.ExperienceResponseRequest;
import com.mypookie.api.model.ExperienceResponse;
import com.mypookie.api.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/public/gifts/{giftId}/responses")
@RequiredArgsConstructor
public class ExperienceResponseController {
 private final GiftRepository gifts;
 private final ExperienceResponseRepository responses;
 private final ObjectMapper json;

 @GetMapping
 public List<ExperienceResponse> list(@PathVariable String giftId,@RequestParam String blockId){
  gifts.findById(giftId).orElseThrow();
  return responses.findByGiftIdAndBlockIdOrderByCreatedAtAsc(giftId,blockId);
 }

 @PostMapping
 public ExperienceResponse create(@PathVariable String giftId,@Valid @RequestBody ExperienceResponseRequest request) throws JsonProcessingException {
  gifts.findById(giftId).orElseThrow();
  var response=new ExperienceResponse();
  response.setId(UUID.randomUUID().toString());
  response.setGiftId(giftId);
  response.setBlockId(request.blockId());
  response.setResponseType(request.responseType());
  response.setContributorName(request.contributorName());
  response.setResponseText(request.responseText());
  response.setPhotoUrls(json.writeValueAsString(request.photoUrls()==null?List.of():request.photoUrls()));
  return responses.save(response);
 }
}
