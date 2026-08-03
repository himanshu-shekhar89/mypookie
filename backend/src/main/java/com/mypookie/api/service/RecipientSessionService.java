package com.mypookie.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;

@Service
public class RecipientSessionService {
 public static final String HEADER="X-Recipient-Session";
 private static final long LIFETIME_SECONDS=2*60*60;
 private final byte[] key;
 private final Clock clock;

 @Autowired
 public RecipientSessionService(@Value("${app.recipient-session-key:${app.gift-secret-key:}}") String configuredKey){
  this(configuredKey,Clock.systemUTC());
 }

 RecipientSessionService(String configuredKey,Clock clock){
  if(configuredKey==null||configuredKey.isBlank())configuredKey="mypookie-local-recipient-session-key";
  this.key=configuredKey.getBytes(StandardCharsets.UTF_8);
  this.clock=clock;
 }

 public String issue(String giftId){
  String payload=giftId+"."+Instant.now(clock).plusSeconds(LIFETIME_SECONDS).getEpochSecond();
  return encode(payload)+"."+encode(sign(payload));
 }

 public void require(String giftId,String token){
  try{
   if(token==null||token.isBlank())throw unauthorized();
   String[] parts=token.split("\\.",2);
   if(parts.length!=2)throw unauthorized();
   String payload=new String(Base64.getUrlDecoder().decode(parts[0]),StandardCharsets.UTF_8);
   byte[] supplied=Base64.getUrlDecoder().decode(parts[1]);
   if(!MessageDigest.isEqual(sign(payload),supplied))throw unauthorized();
   int separator=payload.lastIndexOf('.');
   if(separator<1||!giftId.equals(payload.substring(0,separator)))throw unauthorized();
   long expiresAt=Long.parseLong(payload.substring(separator+1));
   if(Instant.now(clock).getEpochSecond()>=expiresAt)throw unauthorized();
  }catch(ResponseStatusException error){throw error;}
  catch(Exception error){throw unauthorized();}
 }

 private byte[] sign(String value){
  try{
   Mac mac=Mac.getInstance("HmacSHA256");
   mac.init(new SecretKeySpec(key,"HmacSHA256"));
   return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
  }catch(Exception error){throw new IllegalStateException("Could not sign recipient session",error);}
 }
 private String encode(String value){return encode(value.getBytes(StandardCharsets.UTF_8));}
 private String encode(byte[] value){return Base64.getUrlEncoder().withoutPadding().encodeToString(value);}
 private ResponseStatusException unauthorized(){return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"A valid recipient session is required.");}
}
