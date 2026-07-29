package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="contribution_invite")
@Getter @Setter @NoArgsConstructor
public class ContributionInvite {
 @Id private String id;
 @Column(name="gift_id",nullable=false) private String giftId;
 @Column(nullable=false,unique=true) private String token;
 @Column(nullable=false) private String status;
 @Column(name="claim_token",unique=true) private String claimToken;
 @Column(name="expires_at",nullable=false) private Instant expiresAt;
 @Column(name="claimed_at") private Instant claimedAt;
 @Column(name="used_at") private Instant usedAt;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
}
