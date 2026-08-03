package com.mypookie.api.controller;

import com.google.firebase.FirebaseApp;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class MediaControllerTest {
 @Test void rejectsAnExecutableRenamedAsAnImage(){
  MediaController media=new MediaController(mock(ObjectProvider.class));
  MockMultipartFile file=new MockMultipartFile("file","photo.png","image/png","not really an image".getBytes());
  ResponseStatusException error=assertThrows(ResponseStatusException.class,()->media.image(file));
  assertEquals(400,error.getStatusCode().value());
 }

 @Test void rejectsUnsupportedMimeTypes(){
  MediaController media=new MediaController(mock(ObjectProvider.class));
  MockMultipartFile file=new MockMultipartFile("file","vector.svg","image/svg+xml","<svg/>".getBytes());
  ResponseStatusException error=assertThrows(ResponseStatusException.class,()->media.image(file));
  assertEquals(400,error.getStatusCode().value());
 }
}
