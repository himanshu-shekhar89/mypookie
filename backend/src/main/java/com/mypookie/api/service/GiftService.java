package com.mypookie.api.service;
import com.fasterxml.jackson.databind.*; import com.mypookie.api.dto.GiftRequest; import com.mypookie.api.model.*;
import com.mypookie.api.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service;
import java.time.Instant; import java.util.*; import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@Service @RequiredArgsConstructor
public class GiftService {
 private final GiftRepository gifts; private final ActivityTypeRepository activities; private final BundleRepository bundles; private final GiftSecretService secrets; private final ObjectMapper json;
 private static final BCryptPasswordEncoder PINS=new BCryptPasswordEncoder(12);
 @Transactional
 public Gift save(String senderId,String id,GiftRequest r){
  Gift g=id==null?new Gift():gifts.findById(id).orElseThrow();
  if(id==null){g.setId(UUID.randomUUID().toString());g.setSenderId(senderId);g.setStatus("DRAFT");}
  if(!g.getSenderId().equals(senderId))throw new SecurityException("Not your gift");
  g.setTitle(r.title());g.setSenderName(r.senderName());g.setRecipientName(r.recipientName());g.setRecipientType(r.recipientType());g.setOccasion(r.occasion());g.setTheme(r.theme());g.setAmbience(r.ambience());g.setBlocksJson(secrets.sanitizeForStorage(r.blocksJson()));g.setScheduledAt(r.scheduledAt());g.setTotalPaise(calculate(r.blocksJson()));g.setUpdatedAt(Instant.now());
  if(r.compatibilityPin()!=null&&!r.compatibilityPin().isBlank())g.setCompatibilityPinHash(PINS.encode(r.compatibilityPin()));
  Gift saved=gifts.saveAndFlush(g);secrets.sync(saved.getId(),r.blocksJson());return saved;
 }
 private int calculate(String blocksJson){
  try{
   JsonNode root=json.readTree(blocksJson);
   JsonNode blocks=root.isArray()?root:root.path("blocks");
   if(!blocks.isArray())throw new IllegalArgumentException("Missing blocks");
   List<String> ids=new ArrayList<>();
   blocks.forEach(n->ids.add(n.path("id").asText()));
   int addOns=0;
   for(JsonNode block:blocks)if("memory".equals(block.path("id").asText())){
    boolean upgraded="true".equalsIgnoreCase(block.path("config").path("extraPages").asText());
    if(upgraded)addOns+=2000;
    String storedPages=block.path("config").path("memoryItems").asText("[]");
    JsonNode pages=json.readTree(storedPages.isBlank()?"[]":storedPages);
    if(!pages.isArray()||pages.size()>(upgraded?12:7))throw new IllegalArgumentException("Memory Lane page limit exceeded");
    for(JsonNode page:pages)if(page.path("images").isArray()&&page.path("images").size()>4)throw new IllegalArgumentException("A collage can contain at most four photos");
   }
   String bundleId=root.path("bundleId").asText("");
   if(!bundleId.isBlank()){
    var bundle=bundles.findById(bundleId).filter(Bundle::isActive).orElse(null);
    if(bundle!=null){
     var configured=json.readTree(bundle.getActivityIds());
     List<String> bundleIds=new ArrayList<>();configured.forEach(node->bundleIds.add(node.asText()));
     if(bundleIds.size()==ids.size()&&new HashSet<>(bundleIds).equals(new HashSet<>(ids)))return bundle.getPricePaise()+addOns;
    }
   }
   Map<String,Integer> prices=new HashMap<>();activities.findAllById(new HashSet<>(ids)).forEach(activity->prices.put(activity.getId(),activity.getPricePaise()));
   if(prices.size()!=new HashSet<>(ids).size())throw new IllegalArgumentException("Unknown block");
   return ids.stream().mapToInt(prices::get).sum()+addOns;
  }
  catch(Exception e){throw new IllegalArgumentException("Invalid blocks JSON");}
 }
 public Gift publish(String senderId,String id){Gift g=gifts.findById(id).orElseThrow();if(!g.getSenderId().equals(senderId))throw new SecurityException();g.setStatus("PUBLISHED");if(g.getShareToken()==null||g.getShareToken().isBlank())g.setShareToken(UUID.randomUUID().toString().replace("-",""));return gifts.save(g);}
}
