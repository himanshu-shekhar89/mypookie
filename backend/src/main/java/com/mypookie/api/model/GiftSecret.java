package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="gift_secret",uniqueConstraints=@UniqueConstraint(name="uq_gift_secret_block",columnNames={"gift_id","block_instance_id"}))
@Getter @Setter @NoArgsConstructor
public class GiftSecret {
 @Id private String id;
 @Column(name="gift_id",nullable=false) private String giftId;
 @Column(name="block_instance_id",nullable=false,length=64) private String blockInstanceId;
 @Column(nullable=false,columnDefinition="LONGTEXT") private String ciphertext;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
}
