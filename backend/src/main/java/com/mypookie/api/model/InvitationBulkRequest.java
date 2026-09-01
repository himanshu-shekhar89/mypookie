package com.mypookie.api.model;
import jakarta.persistence.*;import lombok.*;import java.time.Instant;
@Entity @Table(name="invitation_bulk_request") @Getter @Setter @NoArgsConstructor
public class InvitationBulkRequest {
 @Id private String id;
 @Column(nullable=false,length=100) private String name;
 @Column(nullable=false,length=180) private String email;
 @Column(nullable=false,length=30) private String phone;
 @Column(nullable=false) private int quantity;
 @Column(name="event_type",nullable=false,length=80) private String eventType;
 @Column(length=1000) private String message;
 @Column(nullable=false,length=20) private String status="PENDING";
 @Column(name="admin_note",length=1000) private String adminNote;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
}
