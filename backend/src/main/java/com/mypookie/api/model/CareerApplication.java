package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="career_application")
@Getter @Setter @NoArgsConstructor
public class CareerApplication {
 @Id private String id;
 @Column(name="firebase_uid") private String firebaseUid;
 @Column(name="campaign_id",nullable=false) private String campaignId;
 @Column(name="full_name",nullable=false) private String fullName;
 private String email;
 private String phone;
 @Column(nullable=false) private String platform;
 @Column(name="social_handle",nullable=false) private String socialHandle;
 @Column(name="screenshot_url",length=1000) private String screenshotUrl;
 @Column(name="social_profile_url",length=1000) private String socialProfileUrl;
 @Column(name="audience_size") private Integer audienceSize;
 @Column(length=700) private String pitch;
 @Column(nullable=false) private String status="PENDING";
 @Column(name="coupon_id") private String couponId;
 @Column(name="admin_note",length=500) private String adminNote;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
}
