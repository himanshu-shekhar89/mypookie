package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="tarot_fortune_pool")
@Getter @Setter @NoArgsConstructor
public class TarotFortunePool {
 @Id private Integer id=1;
 @Column(name="fortunes_json",nullable=false,columnDefinition="LONGTEXT") private String fortunesJson="[]";
 @Column(name="used_count",nullable=false) private int usedCount;
 @Column(name="generated_at",nullable=false) private Instant generatedAt=Instant.now();
}
