package com.mypookie.api.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class RecipientSessionServiceTest {
 private static final Instant NOW=Instant.parse("2026-08-03T00:00:00Z");

 @Test void acceptsAValidSessionForItsGift(){
  var sessions=serviceAt(NOW);
  assertDoesNotThrow(()->sessions.require("gift-one",sessions.issue("gift-one")));
 }

 @Test void rejectsMissingTamperedAndCrossGiftSessions(){
  var sessions=serviceAt(NOW);
  String token=sessions.issue("gift-one");
  assertAll(
   ()->assertThrows(ResponseStatusException.class,()->sessions.require("gift-one",null)),
   ()->assertThrows(ResponseStatusException.class,()->sessions.require("gift-two",token)),
   ()->assertThrows(ResponseStatusException.class,()->sessions.require("gift-one",token.substring(0,token.length()-1)+"x"))
  );
 }

 @Test void rejectsExpiredSessions(){
  String token=serviceAt(NOW).issue("gift-one");
  assertThrows(ResponseStatusException.class,()->serviceAt(NOW.plusSeconds(2*60*60)).require("gift-one",token));
 }

 private RecipientSessionService serviceAt(Instant instant){
  return new RecipientSessionService("test-session-signing-key",Clock.fixed(instant, ZoneOffset.UTC));
 }
}
