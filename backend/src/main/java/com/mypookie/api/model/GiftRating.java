package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="gift_rating")
@Getter @Setter @NoArgsConstructor
public class GiftRating {
 @Id private String id;
 @Column(name="gift_id",nullable=false,unique=true) private String giftId;
 @Column(nullable=false) private int stars;
 @Column(length=500) private String comment;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
}
