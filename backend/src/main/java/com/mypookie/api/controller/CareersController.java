package com.mypookie.api.controller;

import com.google.cloud.storage.Blob;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import com.mypookie.api.model.*;
import com.mypookie.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/public/careers")
@RequiredArgsConstructor
public class CareersController {
 private final CareerCampaignRepository campaigns;
 private final CareerApplicationRepository applications;
 private final ObjectProvider<FirebaseApp> firebaseApp;

 @GetMapping("/campaign")
 public CareerCampaign campaign(){
  return campaigns.findById("social-promotional").orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Campaign unavailable"));
 }

 @PostMapping(value="/applications",consumes="multipart/form-data")
 @ResponseStatus(HttpStatus.CREATED)
 public Map<String,String> apply(
  @RequestParam String fullName,@RequestParam String phone,@RequestParam String socialProfileUrl,
  @RequestParam(required=false) String email){
  var campaign=campaign();
  if(!campaign.isActive())throw new ResponseStatusException(HttpStatus.CONFLICT,"Applications are currently paused.");
  String cleanName=required(fullName,"Add your full name",100);
  String cleanPhone=required(phone,"Add your phone number",30);
  if(!cleanPhone.matches("^[+0-9 ()-]{8,30}$"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Add a valid phone number.");
  String cleanProfile=required(socialProfileUrl,"Add your social profile link",1000);
  if(!cleanProfile.matches("^https?://.+"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Add a complete social profile link.");
  String cleanEmail=email==null||email.isBlank()?null:email.trim().toLowerCase();
  if(cleanEmail!=null&&!cleanEmail.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Add a valid email address.");
  if(cleanEmail!=null&&applications.existsByEmailIgnoreCaseAndCampaignIdAndStatusIn(cleanEmail,campaign.getId(),List.of("PENDING","APPROVED")))throw new ResponseStatusException(HttpStatus.CONFLICT,"You already have an active application.");
  var application=new CareerApplication();
  application.setId(UUID.randomUUID().toString());application.setCampaignId(campaign.getId());application.setFullName(cleanName);
  application.setEmail(cleanEmail);application.setPhone(cleanPhone);application.setPlatform("SOCIAL");application.setSocialHandle(cleanProfile);
  application.setSocialProfileUrl(cleanProfile);
  applications.save(application);
  return Map.of("id",application.getId(),"status",application.getStatus());
 }

 private String required(String value,String message,int max){
  if(value==null||value.trim().isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,message);
  String clean=value.trim();if(clean.length()>max)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"That value is too long.");return clean;
 }
 /* Legacy screenshot storage retained for applications submitted before this streamlined form. */
 private String storeScreenshot(org.springframework.web.multipart.MultipartFile file){
  String type=file.getContentType()==null?"":file.getContentType().toLowerCase();
  if(file.isEmpty()||!Set.of("image/jpeg","image/png","image/webp").contains(type))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Upload a JPG, PNG or WebP screenshot.");
  if(file.getSize()>5L*1024*1024)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"Screenshot must be under 5 MB.");
  try{
   byte[] bytes=file.getBytes();
   boolean valid=starts(bytes,0xFF,0xD8)||starts(bytes,0x89,0x50,0x4E,0x47)||ascii(bytes,"RIFF",0)&&ascii(bytes,"WEBP",8);
   if(!valid)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"That screenshot is not a valid image.");
   var bucket=StorageClient.getInstance(firebaseApp.getObject()).bucket();
   String ext=type.contains("png")?".png":type.contains("webp")?".webp":".jpg";
   String objectName="career-applications/"+UUID.randomUUID()+ext;
   Blob blob=bucket.create(objectName,bytes,type);String token=UUID.randomUUID().toString();
   blob.toBuilder().setMetadata(Map.of("firebaseStorageDownloadTokens",token,"cacheControl","private,max-age=3600")).build().update();
   String encoded=URLEncoder.encode(objectName,StandardCharsets.UTF_8).replace("+","%20");
   return "https://firebasestorage.googleapis.com/v0/b/"+bucket.getName()+"/o/"+encoded+"?alt=media&token="+token;
  }catch(ResponseStatusException error){throw error;}catch(Exception error){throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Screenshot upload is temporarily unavailable.",error);}
 }
 private boolean starts(byte[] bytes,int...expected){if(bytes.length<expected.length)return false;for(int i=0;i<expected.length;i++)if((bytes[i]&0xFF)!=expected[i])return false;return true;}
 private boolean ascii(byte[] bytes,String value,int offset){if(bytes.length<offset+value.length())return false;for(int i=0;i<value.length();i++)if(bytes[offset+i]!=(byte)value.charAt(i))return false;return true;}
}
