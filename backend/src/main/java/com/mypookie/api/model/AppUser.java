package com.mypookie.api.model;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Table(name="app_user") @Getter @Setter @NoArgsConstructor
public class AppUser {
 @Id private String id; @Column(name="firebase_uid",nullable=false,unique=true) private String firebaseUid;
 @Column(nullable=false) private String email; @Column(name="display_name") private String displayName;
 @Column(nullable=false) private String role="USER"; @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
}
