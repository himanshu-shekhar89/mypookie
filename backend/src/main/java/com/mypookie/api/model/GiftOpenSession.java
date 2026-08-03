package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="gift_open_session",uniqueConstraints=@UniqueConstraint(name="uk_open_session_gift_client",columnNames={"gift_id","client_session_id"}))
@Getter @Setter @NoArgsConstructor
public class GiftOpenSession {
 @Id private String id;
 @Column(name="gift_id",nullable=false) private String giftId;
 @Column(name="client_session_id",nullable=false,length=64) private String clientSessionId;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
}
