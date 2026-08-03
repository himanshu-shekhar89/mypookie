package com.mypookie.api.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mypookie.api.dto.ExperienceResponseRequest;
import com.mypookie.api.model.ExperienceResponse;
import com.mypookie.api.repository.*;
import com.mypookie.api.service.RecipientSessionService;
import com.mypookie.api.service.FirebaseAuthenticationFilter;
import com.mypookie.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.*;

@RestController
@RequestMapping("/api/public/gifts/{giftId}/responses")
@RequiredArgsConstructor
public class ExperienceResponseController {
 private final GiftRepository gifts;
 private final ExperienceResponseRepository responses;
 private final ObjectMapper json;
 private final RecipientSessionService recipientSessions;
 private final UserService users;

 @GetMapping("/context")
 public Map<String,String> context(@PathVariable String giftId,@RequestHeader(value=RecipientSessionService.HEADER,required=false) String session,@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal){
  var gift=gifts.findById(giftId).orElseThrow();
  requireReadAccess(gift,session,principal);
  return Map.of("recipientName",gift.getRecipientName(),"occasion",gift.getOccasion(),"title",gift.getTitle());
 }

 @GetMapping
 public List<ExperienceResponse> list(@PathVariable String giftId,@RequestParam String blockId,@RequestHeader(value=RecipientSessionService.HEADER,required=false) String session,@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal){
  var gift=gifts.findById(giftId).orElseThrow();
  requireReadAccess(gift,session,principal);
  return responses.findByGiftIdAndBlockIdOrderByCreatedAtAsc(giftId,blockId).stream().filter(response->!"THIS_OR_THAT".equalsIgnoreCase(response.getResponseType())).toList();
 }

 @PostMapping
 public ExperienceResponse create(@PathVariable String giftId,@RequestHeader(value=RecipientSessionService.HEADER,required=false) String session,@Valid @RequestBody ExperienceResponseRequest request) throws JsonProcessingException {
  gifts.findById(giftId).orElseThrow();
  recipientSessions.require(giftId,session);
  if("GROUP_MESSAGE".equalsIgnoreCase(request.responseType()))throw new ResponseStatusException(HttpStatus.GONE,"Use a one-time contribution invitation.");
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

 private void requireReadAccess(com.mypookie.api.model.Gift gift,String session,FirebaseAuthenticationFilter.UserPrincipal principal){
  if(principal!=null&&gift.getSenderId().equals(users.resolve(principal).getId()))return;
  recipientSessions.require(gift.getId(),session);
 }
}
