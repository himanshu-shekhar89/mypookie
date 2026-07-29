package com.mypookie.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RazorpayService {
 private final ObjectMapper json;
 private final HttpClient http=HttpClient.newBuilder().build();
 @Value("${app.razorpay.key-id:}") private String keyId;
 @Value("${app.razorpay.key-secret:}") private String keySecret;

 public boolean configured(){return !keyId.isBlank()&&!keySecret.isBlank();}
 public String keyId(){return configured()?keyId:"";}

 public String createOrder(int amountPaise,String currency,String receipt){
  if(!configured())throw new IllegalStateException("Razorpay is not configured");
  try{
   var payload=json.createObjectNode();
   payload.put("amount",amountPaise);
   payload.put("currency",currency);
   payload.put("receipt",receipt);
   var request=HttpRequest.newBuilder(URI.create("https://api.razorpay.com/v1/orders"))
    .header("Authorization","Basic "+Base64.getEncoder().encodeToString((keyId+":"+keySecret).getBytes(StandardCharsets.UTF_8)))
    .header("Content-Type","application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build();
   var response=http.send(request,HttpResponse.BodyHandlers.ofString());
   if(response.statusCode()<200||response.statusCode()>=300)throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Razorpay could not create the payment order.");
   return json.readTree(response.body()).path("id").asText();
  }catch(ResponseStatusException error){throw error;}
  catch(Exception error){throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,"Razorpay is temporarily unavailable.",error);}
 }

 public boolean verify(String serverOrderId,String paymentId,String signature){
  if(!configured())return false;
  try{
   var mac=Mac.getInstance("HmacSHA256");
   mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
   var expected=HexFormat.of().formatHex(mac.doFinal((serverOrderId+"|"+paymentId).getBytes(StandardCharsets.UTF_8)));
   return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),signature.getBytes(StandardCharsets.UTF_8));
  }catch(Exception error){throw new IllegalStateException("Could not verify payment",error);}
 }
}
