package com.mypookie.api.service;

import com.mypookie.api.model.*;
import com.mypookie.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class GiftOpenService {
 private final GiftRepository gifts;
 private final GiftOpenSessionRepository sessions;

 @Transactional
 public Gift register(String giftId,String suppliedClientSessionId){
  Gift gift=gifts.findLockedById(giftId).orElseThrow();
  String clientSessionId=normalize(suppliedClientSessionId);
  if(sessions.existsByGiftIdAndClientSessionId(giftId,clientSessionId))return gift;
  if(gift.getMaxOpenCount()>0&&gift.getOpenCount()>=gift.getMaxOpenCount())
   throw new ResponseStatusException(HttpStatus.GONE,"This gift has reached its opening limit.");
  GiftOpenSession session=new GiftOpenSession();
  session.setId(UUID.randomUUID().toString());
  session.setGiftId(giftId);
  session.setClientSessionId(clientSessionId);
  sessions.save(session);
  gift.setOpenCount(gift.getOpenCount()+1);
  if(gift.getOpenedAt()==null)gift.setOpenedAt(Instant.now());
  if(gift.getCurrentStep()<1)gift.setCurrentStep(1);
  return gifts.save(gift);
 }

 private String normalize(String value){
  if(value!=null&&value.matches("^[A-Za-z0-9_-]{16,64}$"))return value;
  return UUID.randomUUID().toString();
 }
}
