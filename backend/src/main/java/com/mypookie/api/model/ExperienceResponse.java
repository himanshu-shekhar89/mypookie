package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="experience_response")
@Getter @Setter @NoArgsConstructor
public class ExperienceResponse {
 @Id private String id;
 @Column(name="gift_id",nullable=false) private String giftId;
 @Column(name="block_id",nullable=false) private String blockId;
 @Column(name="response_type",nullable=false) private String responseType;
 @Column(name="contributor_name",nullable=false) private String contributorName;
 @Column(name="response_text",nullable=false,columnDefinition="LONGTEXT") private String responseText;
 @Column(name="photo_urls",nullable=false,columnDefinition="LONGTEXT") private String photoUrls="[]";
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
}
