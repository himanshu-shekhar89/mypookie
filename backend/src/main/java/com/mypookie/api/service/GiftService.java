package com.mypookie.api.service;
import com.fasterxml.jackson.databind.*; import com.mypookie.api.dto.GiftRequest; import com.mypookie.api.model.*;
import com.mypookie.api.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service;
import java.time.Instant; import java.util.*;
@Service @RequiredArgsConstructor
public class GiftService {
 private final GiftRepository gifts; private final ActivityTypeRepository activities; private final ObjectMapper json;
 public Gift save(String senderId,String id,GiftRequest r){
  Gift g=id==null?new Gift():gifts.findById(id).orElseThrow();
  if(id==null){g.setId(UUID.randomUUID().toString());g.setSenderId(senderId);g.setStatus("DRAFT");}
  if(!g.getSenderId().equals(senderId))throw new SecurityException("Not your gift");
  g.setTitle(r.title());g.setRecipientName(r.recipientName());g.setRecipientType(r.recipientType());g.setOccasion(r.occasion());g.setTheme(r.theme());g.setAmbience(r.ambience());g.setBlocksJson(r.blocksJson());g.setScheduledAt(r.scheduledAt());g.setTotalPaise(calculate(r.blocksJson()));g.setUpdatedAt(Instant.now());return gifts.save(g);
 }
 private int calculate(String blocksJson){
  try{
   JsonNode root=json.readTree(blocksJson);
   JsonNode blocks=root.isArray()?root:root.path("blocks");
   if(!blocks.isArray())throw new IllegalArgumentException("Missing blocks");
   Set<String> ids=new HashSet<>();
   blocks.forEach(n->ids.add(n.path("id").asText()));
   return activities.findAllById(ids).stream().mapToInt(ActivityType::getPricePaise).sum();
  }
  catch(Exception e){throw new IllegalArgumentException("Invalid blocks JSON");}
 }
 public Gift publish(String senderId,String id){Gift g=gifts.findById(id).orElseThrow();if(!g.getSenderId().equals(senderId))throw new SecurityException();g.setStatus("PUBLISHED");if(g.getShareToken()==null||g.getShareToken().isBlank())g.setShareToken(UUID.randomUUID().toString().replace("-",""));return gifts.save(g);}
}
