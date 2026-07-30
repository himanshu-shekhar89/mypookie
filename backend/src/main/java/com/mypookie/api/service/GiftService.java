package com.mypookie.api.service;
import com.fasterxml.jackson.databind.*; import com.mypookie.api.dto.GiftRequest; import com.mypookie.api.model.*;
import com.mypookie.api.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service;
import java.time.Instant; import java.util.*; import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class GiftService {
 private final GiftRepository gifts; private final ActivityTypeRepository activities; private final BundleRepository bundles; private final GiftSecretService secrets; private final ObjectMapper json;
 @Transactional
 public Gift save(String senderId,String id,GiftRequest r){
  Gift g=id==null?new Gift():gifts.findById(id).orElseThrow();
  if(id==null){g.setId(UUID.randomUUID().toString());g.setSenderId(senderId);g.setStatus("DRAFT");}
  if(!g.getSenderId().equals(senderId))throw new SecurityException("Not your gift");
  g.setTitle(r.title());g.setSenderName(r.senderName());g.setRecipientName(r.recipientName());g.setRecipientType(r.recipientType());g.setOccasion(r.occasion());g.setTheme(r.theme());g.setAmbience(r.ambience());g.setBlocksJson(secrets.sanitizeForStorage(r.blocksJson()));g.setScheduledAt(r.scheduledAt());g.setTotalPaise(calculate(r.blocksJson()));g.setUpdatedAt(Instant.now());
  Gift saved=gifts.saveAndFlush(g);secrets.sync(saved.getId(),r.blocksJson());return saved;
 }
 private int calculate(String blocksJson){
  try{
   JsonNode root=json.readTree(blocksJson);
   JsonNode blocks=root.isArray()?root:root.path("blocks");
   if(!blocks.isArray())throw new IllegalArgumentException("Missing blocks");
   List<String> ids=new ArrayList<>();
   blocks.forEach(n->ids.add(n.path("id").asText()));
   String bundleId=root.path("bundleId").asText("");
   if(!bundleId.isBlank()){
    var bundle=bundles.findById(bundleId).filter(Bundle::isActive).orElse(null);
    if(bundle!=null){
     var configured=json.readTree(bundle.getActivityIds());
     List<String> bundleIds=new ArrayList<>();configured.forEach(node->bundleIds.add(node.asText()));
     if(bundleIds.size()==ids.size()&&new HashSet<>(bundleIds).equals(new HashSet<>(ids)))return bundle.getPricePaise();
    }
   }
   Map<String,Integer> prices=new HashMap<>();activities.findAllById(new HashSet<>(ids)).forEach(activity->prices.put(activity.getId(),activity.getPricePaise()));
   if(prices.size()!=new HashSet<>(ids).size())throw new IllegalArgumentException("Unknown block");
   return ids.stream().mapToInt(prices::get).sum();
  }
  catch(Exception e){throw new IllegalArgumentException("Invalid blocks JSON");}
 }
 public Gift publish(String senderId,String id){Gift g=gifts.findById(id).orElseThrow();if(!g.getSenderId().equals(senderId))throw new SecurityException();g.setStatus("PUBLISHED");if(g.getShareToken()==null||g.getShareToken().isBlank())g.setShareToken(UUID.randomUUID().toString().replace("-",""));return gifts.save(g);}
}
