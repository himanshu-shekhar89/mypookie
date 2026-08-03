package com.mypookie.api.model;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Table(name="gift") @Getter @Setter @NoArgsConstructor
public class Gift {
 @Id private String id; @Column(name="sender_id",nullable=false) private String senderId;
 @Column(name="sender_name",nullable=false,length=80) private String senderName;
 @Column(nullable=false) private String title; @Column(name="recipient_name",nullable=false) private String recipientName;
 @Column(name="recipient_type",nullable=false) private String recipientType; @Column(nullable=false) private String occasion;
 @Column(nullable=false) private String theme; @Column(nullable=false) private String ambience;
 @Column(name="blocks_json",nullable=false,columnDefinition="LONGTEXT") private String blocksJson;
 @Column(nullable=false) private String status; @Column(name="total_paise",nullable=false) private int totalPaise;
 @Column(name="share_token",unique=true) private String shareToken; @Column(name="scheduled_at") private Instant scheduledAt;
 @Column(name="compatibility_pin_hash",length=100) private String compatibilityPinHash;
 @Column(name="access_pin_hash",length=100) private String accessPinHash;
 @Column(name="max_open_count",nullable=false) private int maxOpenCount;
 @Column(name="open_count",nullable=false) private int openCount;
 @Column(name="current_step",nullable=false) private int currentStep;
 @Column(name="total_steps",nullable=false) private int totalSteps;
 @Column(name="opened_at") private Instant openedAt;
 @Column(name="completed_at") private Instant completedAt;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
}
