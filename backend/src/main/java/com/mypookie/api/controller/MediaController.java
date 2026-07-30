package com.mypookie.api.controller;

import com.google.cloud.storage.Blob;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
 private final ObjectProvider<FirebaseApp> firebaseApp;

 public record UploadResult(String url,String name,long size){}

 @PostMapping("/video")
 public UploadResult video(@RequestParam("file") MultipartFile file){
  return store(file,"video",30L*1024*1024);
 }
 @PostMapping("/image")
 public UploadResult image(@RequestParam("file") MultipartFile file){
  return store(file,"image",8L*1024*1024);
 }
 @PostMapping("/audio")
 public UploadResult audio(@RequestParam("file") MultipartFile file){
  return store(file,"audio",15L*1024*1024);
 }

 private UploadResult store(MultipartFile file,String kind,long maxSize){
  String contentType=file.getContentType()==null?"":file.getContentType().toLowerCase();
  if(file.isEmpty()||!contentType.startsWith(kind+"/"))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose a valid "+kind+" file.");
  if(file.getSize()>maxSize)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"That "+kind+" file is too large.");
  try{
   var bucket=StorageClient.getInstance(firebaseApp.getObject()).bucket();
   String extension=extension(file.getOriginalFilename(),contentType,kind);
   String objectName="gift-media/"+kind+"/"+UUID.randomUUID()+extension;
   Blob blob=bucket.create(objectName,file.getBytes(),contentType);
   String token=UUID.randomUUID().toString();
   blob.toBuilder().setMetadata(Map.of("firebaseStorageDownloadTokens",token,"cacheControl","private,max-age=3600")).build().update();
   String encoded=URLEncoder.encode(objectName,StandardCharsets.UTF_8).replace("+","%20");
   String url="https://firebasestorage.googleapis.com/v0/b/"+bucket.getName()+"/o/"+encoded+"?alt=media&token="+token;
   return new UploadResult(url,file.getOriginalFilename()==null?"video-note"+extension:file.getOriginalFilename(),file.getSize());
  }catch(Exception error){
   throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Secure "+kind+" storage is unavailable.",error);
  }
 }

 private String extension(String filename,String contentType,String kind){
  if(filename!=null&&filename.lastIndexOf('.')>=0){
   String value=filename.substring(filename.lastIndexOf('.')).toLowerCase();
   if(value.matches("\\.(mp4|webm|mov|m4v|jpg|jpeg|png|webp|gif|mp3|wav|m4a|aac|ogg)"))return value;
  }
  if("image".equals(kind))return contentType.contains("png")?".png":contentType.contains("webp")?".webp":".jpg";
  if("audio".equals(kind))return contentType.contains("mpeg")?".mp3":contentType.contains("wav")?".wav":".m4a";
  return contentType.contains("mp4")?".mp4":contentType.contains("quicktime")?".mov":".webm";
 }
}
