package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="contribution_claim")
@Getter @Setter @NoArgsConstructor
public class ContributionClaim {
 @Id private String id;
 @Column(name="invite_id",nullable=false) private String inviteId;
 @Column(name="claim_token",nullable=false,unique=true) private String claimToken;
 @Column(nullable=false) private String status;
 @Column(name="expires_at",nullable=false) private Instant expiresAt;
 @Column(name="used_at") private Instant usedAt;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
}

