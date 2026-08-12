package com.mypookie.api.model;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Table(name="invitation") @Getter @Setter @NoArgsConstructor
public class Invitation {
 @Id private String id;
 @Column(name="creator_id",nullable=false) private String creatorId;
 @Column(name="share_token",unique=true,length=64) private String shareToken;
 @Column(nullable=false,length=20) private String status;
 @Column(nullable=false,length=160) private String title;
 @Column(nullable=false,length=40) private String tradition;
 @Column(name="details_json",nullable=false,columnDefinition="LONGTEXT") private String detailsJson;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
}
