package com.mypookie.api.service;

import com.mypookie.api.model.Gift;
import com.mypookie.api.repository.GiftOpenSessionRepository;
import com.mypookie.api.repository.GiftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class GiftOpenServiceTest {
 private GiftRepository gifts;
 private GiftOpenSessionRepository sessions;
 private GiftOpenService service;
 private Gift gift;

 @BeforeEach void setUp(){
  gifts=mock(GiftRepository.class);sessions=mock(GiftOpenSessionRepository.class);service=new GiftOpenService(gifts,sessions);
  gift=new Gift();gift.setId("gift-one");gift.setMaxOpenCount(2);gift.setOpenCount(1);
  when(gifts.findLockedById("gift-one")).thenReturn(Optional.of(gift));
  when(gifts.save(any())).thenAnswer(call->call.getArgument(0));
 }

 @Test void refreshInTheSameBrowserSessionDoesNotConsumeAnotherOpen(){
  when(sessions.existsByGiftIdAndClientSessionId("gift-one","browser-session-1234")).thenReturn(true);
  service.register("gift-one","browser-session-1234");
  assertEquals(1,gift.getOpenCount());
  verify(sessions,never()).save(any());
 }

 @Test void aNewBrowserSessionConsumesExactlyOneOpen(){
  service.register("gift-one","browser-session-5678");
  assertEquals(2,gift.getOpenCount());
  assertNotNull(gift.getOpenedAt());
  verify(sessions).save(any());
 }

 @Test void openingLimitRejectsANewSession(){
  gift.setOpenCount(2);
  assertThrows(ResponseStatusException.class,()->service.register("gift-one","browser-session-9999"));
  verify(sessions,never()).save(any());
 }
}
