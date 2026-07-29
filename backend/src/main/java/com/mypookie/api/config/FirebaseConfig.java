package com.mypookie.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import java.io.*;
import java.nio.file.*;
import java.util.Base64;

@Configuration
@RequiredArgsConstructor
public class FirebaseConfig {
 @Bean
 @ConditionalOnProperty(name="app.auth.firebase-enabled",havingValue="true")
 FirebaseApp firebaseApp(@Value("${app.auth.firebase-service-account-base64:}") String encoded,@Value("${GOOGLE_APPLICATION_CREDENTIALS:}") String credentialsPath) throws IOException {
  InputStream source;
  if(encoded!=null&&!encoded.isBlank())source=new ByteArrayInputStream(Base64.getDecoder().decode(encoded));
  else if(credentialsPath!=null&&!credentialsPath.isBlank())source=Files.newInputStream(Path.of(credentialsPath));
  else throw new IllegalStateException("Firebase authentication is enabled but no service account is configured.");
  try(source){
   var options=FirebaseOptions.builder().setCredentials(GoogleCredentials.fromStream(source)).build();
   return FirebaseApp.getApps().isEmpty()?FirebaseApp.initializeApp(options):FirebaseApp.getInstance();
  }
 }
}
