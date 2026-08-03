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
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {
 private static final Map<String,Set<String>> ALLOWED_TYPES=Map.of(
  "image",Set.of("image/jpeg","image/png","image/webp","image/gif"),
  "video",Set.of("video/mp4","video/webm","video/quicktime","video/x-m4v"),
  "audio",Set.of("audio/mpeg","audio/wav","audio/x-wav","audio/mp4","audio/x-m4a","audio/aac","audio/ogg")
 );
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
  if(file.isEmpty()||!ALLOWED_TYPES.getOrDefault(kind,Set.of()).contains(contentType))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose a supported "+kind+" file.");
  if(file.getSize()>maxSize)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"That "+kind+" file is too large.");
  try{
   byte[] contents=file.getBytes();
   if(!hasValidSignature(contents,kind,contentType))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"That file does not contain valid "+kind+" data.");
   var bucket=StorageClient.getInstance(firebaseApp.getObject()).bucket();
   String extension=extension(file.getOriginalFilename(),contentType,kind);
   String objectName="gift-media/"+kind+"/"+UUID.randomUUID()+extension;
   Blob blob=bucket.create(objectName,contents,contentType);
   String token=UUID.randomUUID().toString();
   blob.toBuilder().setMetadata(Map.of("firebaseStorageDownloadTokens",token,"cacheControl","private,max-age=3600")).build().update();
   String encoded=URLEncoder.encode(objectName,StandardCharsets.UTF_8).replace("+","%20");
   String url="https://firebasestorage.googleapis.com/v0/b/"+bucket.getName()+"/o/"+encoded+"?alt=media&token="+token;
   return new UploadResult(url,file.getOriginalFilename()==null?"video-note"+extension:file.getOriginalFilename(),file.getSize());
  }catch(ResponseStatusException error){throw error;}
  catch(Exception error){
   throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Secure "+kind+" storage is unavailable.",error);
  }
 }

 private boolean hasValidSignature(byte[] bytes,String kind,String contentType){
  if(bytes.length<4)return false;
  if("image".equals(kind))return starts(bytes,0xFF,0xD8)||starts(bytes,0x89,0x50,0x4E,0x47)||ascii(bytes,"GIF8",0)||ascii(bytes,"RIFF",0)&&ascii(bytes,"WEBP",8);
  if("video".equals(kind))return starts(bytes,0x1A,0x45,0xDF,0xA3)||ascii(bytes,"ftyp",4);
  if("audio".equals(kind))return ascii(bytes,"ID3",0)||starts(bytes,0xFF,0xFB)||starts(bytes,0xFF,0xF3)||starts(bytes,0xFF,0xF2)||ascii(bytes,"RIFF",0)&&ascii(bytes,"WAVE",8)||ascii(bytes,"OggS",0)||ascii(bytes,"ftyp",4)||"audio/aac".equals(contentType)&&starts(bytes,0xFF,0xF1);
  return false;
 }
 private boolean starts(byte[] bytes,int...expected){if(bytes.length<expected.length)return false;for(int index=0;index<expected.length;index++)if((bytes[index]&0xFF)!=expected[index])return false;return true;}
 private boolean ascii(byte[] bytes,String value,int offset){if(bytes.length<offset+value.length())return false;for(int index=0;index<value.length();index++)if(bytes[offset+index]!=(byte)value.charAt(index))return false;return true;}

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
