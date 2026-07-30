package com.mypookie.api.service;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mypookie.api.model.GiftSecret;
import com.mypookie.api.repository.GiftSecretRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.*;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

@Service @RequiredArgsConstructor
public class GiftSecretService {
 public static final String SEALED="__MYPOOKIE_SECURE__";
 private final GiftSecretRepository secrets;
 private final ObjectMapper json;
 @Value("${app.gift-secret-key:}") private String configuredKey;

 public String sanitizeForStorage(String blocksJson){
  try{
   JsonNode root=json.readTree(blocksJson);
   JsonNode blocks=root.isArray()?root:root.path("blocks");
   if(blocks.isArray())for(JsonNode block:blocks)if("gift".equals(block.path("id").asText())&&block.path("config").isObject()){
    ObjectNode config=(ObjectNode)block.path("config");
    if(config.has("code")&&!config.path("code").asText("").isBlank())config.put("code",SEALED);
   }
   return json.writeValueAsString(root);
  }catch(Exception error){throw new IllegalArgumentException("Invalid blocks JSON");}
 }

 public void sync(String giftId,String blocksJson){
  try{
   JsonNode root=json.readTree(blocksJson);
   JsonNode blocks=root.isArray()?root:root.path("blocks");
   if(!blocks.isArray())return;
   Set<String> presentGiftBlocks=new HashSet<>();
   for(JsonNode block:blocks){
    if(!"gift".equals(block.path("id").asText()))continue;
    String blockId=block.path("instanceId").asText(block.path("id").asText());
    presentGiftBlocks.add(blockId);
    String value=block.path("config").path("code").asText("");
    if(SEALED.equals(value))continue;
    if(value.isBlank()){secrets.deleteByGiftIdAndBlockInstanceId(giftId,blockId);continue;}
    GiftSecret secret=secrets.findByGiftIdAndBlockInstanceId(giftId,blockId).orElseGet(()->{
     GiftSecret created=new GiftSecret();created.setId(UUID.randomUUID().toString());created.setGiftId(giftId);created.setBlockInstanceId(blockId);return created;
    });
    secret.setCiphertext(encrypt(value));
    secret.setUpdatedAt(Instant.now());
    secrets.save(secret);
   }
   secrets.findByGiftId(giftId).stream().filter(secret->!presentGiftBlocks.contains(secret.getBlockInstanceId())).forEach(secrets::delete);
  }catch(Exception error){
   if(error instanceof IllegalStateException state)throw state;
   throw new IllegalArgumentException("Could not protect gift-card details");
  }
 }

 public String reveal(String giftId,String storedJson){
  try{
   JsonNode root=json.readTree(storedJson);
   JsonNode blocks=root.isArray()?root:root.path("blocks");
   Map<String,GiftSecret> byBlock=new HashMap<>();
   secrets.findByGiftId(giftId).forEach(secret->byBlock.put(secret.getBlockInstanceId(),secret));
   if(blocks.isArray())for(JsonNode block:blocks){
    if(!"gift".equals(block.path("id").asText())||!block.path("config").isObject())continue;
    String blockId=block.path("instanceId").asText(block.path("id").asText());
    GiftSecret secret=byBlock.get(blockId);
    if(secret!=null)((ObjectNode)block.path("config")).put("code",decrypt(secret.getCiphertext()));
   }
   return json.writeValueAsString(root);
  }catch(Exception error){throw new IllegalStateException("Could not reveal protected gift-card details");}
 }

 private SecretKeySpec key(){
  try{
   byte[] raw;
   if(configuredKey!=null&&!configuredKey.isBlank())raw=Base64.getDecoder().decode(configuredKey);
   else raw=MessageDigest.getInstance("SHA-256").digest("mypookie-local-development-only-key".getBytes(StandardCharsets.UTF_8));
   if(raw.length!=32)raw=MessageDigest.getInstance("SHA-256").digest(raw);
   return new SecretKeySpec(raw,"AES");
  }catch(Exception error){throw new IllegalStateException("Gift encryption key is invalid");}
 }
 private String encrypt(String plaintext){
  try{
   byte[] iv=new byte[12];SecureRandom.getInstanceStrong().nextBytes(iv);
   Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key(),new GCMParameterSpec(128,iv));
   byte[] encrypted=cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
   byte[] sealed=new byte[iv.length+encrypted.length];System.arraycopy(iv,0,sealed,0,iv.length);System.arraycopy(encrypted,0,sealed,iv.length,encrypted.length);
   return Base64.getEncoder().encodeToString(sealed);
  }catch(Exception error){throw new IllegalStateException("Could not encrypt gift secret");}
 }
 private String decrypt(String value){
  try{
   byte[] sealed=Base64.getDecoder().decode(value);byte[] iv=Arrays.copyOfRange(sealed,0,12);byte[] encrypted=Arrays.copyOfRange(sealed,12,sealed.length);
   Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,iv));
   return new String(cipher.doFinal(encrypted),StandardCharsets.UTF_8);
  }catch(Exception error){throw new IllegalStateException("Could not decrypt gift secret");}
 }
}
