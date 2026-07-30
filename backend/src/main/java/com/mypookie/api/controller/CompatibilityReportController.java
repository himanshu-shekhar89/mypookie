package com.mypookie.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mypookie.api.repository.ExperienceResponseRepository;
import com.mypookie.api.repository.GiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/public/gifts/{giftId}/compatibility-report")
@RequiredArgsConstructor
public class CompatibilityReportController {
 private final GiftRepository gifts;
 private final ExperienceResponseRepository responses;
 private final ObjectMapper json;
 private static final BCryptPasswordEncoder PINS=new BCryptPasswordEncoder();

 public record ReportRequest(String pin,String blockId){}
 public record Answer(String prompt,String senderChoice,String recipientChoice,boolean match){}
 public record Report(int score,int matches,int total,String label,List<Answer>answers){}

 @PostMapping
 public Report report(@PathVariable String giftId,@RequestBody ReportRequest request){
  var gift=gifts.findById(giftId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Gift not found."));
  if(gift.getCompatibilityPinHash()==null||request.pin()==null||!PINS.matches(request.pin(),gift.getCompatibilityPinHash()))
   throw new ResponseStatusException(HttpStatus.FORBIDDEN,"That report PIN is not correct.");
  try{
   JsonNode root=json.readTree(gift.getBlocksJson());
   JsonNode blocks=root.isArray()?root:root.path("blocks");
   JsonNode target=null;
   for(JsonNode block:blocks){
    String instance=block.path("instanceId").asText(block.path("id").asText());
    if("thisorthat".equals(block.path("id").asText())&&instance.equals(request.blockId())){target=block;break;}
   }
   if(target==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Compatibility activity not found.");
   JsonNode rounds=json.readTree(target.path("config").path("thisOrThatRounds").asText("[]"));
   var saved=responses.findByGiftIdAndBlockIdOrderByCreatedAtAsc(giftId,request.blockId()).stream()
    .filter(response->"THIS_OR_THAT".equalsIgnoreCase(response.getResponseType())).reduce((first,second)->second)
    .orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"The recipient has not finished this activity yet."));
   JsonNode choices=json.readTree(saved.getResponseText()).path("choices");
   List<Answer> answers=new ArrayList<>();
   int matches=0;
   for(int index=0;index<rounds.size();index++){
    JsonNode round=rounds.path(index);
    String senderSide=round.path("senderPick").asText("");
    String senderChoice="left".equals(senderSide)?round.path("left").asText():"right".equals(senderSide)?round.path("right").asText():"Not selected";
    String recipientChoice=choices.path(index).asText("Not answered");
    boolean match=!senderSide.isBlank()&&senderChoice.equals(recipientChoice);
    if(match)matches++;
    answers.add(new Answer(round.path("prompt").asText("Quick choice"),senderChoice,recipientChoice,match));
   }
   int total=answers.size();
   int score=total==0?0:(int)Math.round(matches*100.0/total);
   String label=score>=80?"Beautifully in sync":score>=55?"A playful perfect mix":score>=30?"Different in the best ways":"Full of surprising contrasts";
   return new Report(score,matches,total,label,answers);
  }catch(ResponseStatusException error){throw error;}
  catch(Exception error){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The compatibility report could not be prepared.");}
 }
}
