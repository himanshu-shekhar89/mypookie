package com.mypookie.api.model;
import jakarta.persistence.*; import lombok.*;
@Entity @Table(name="bundle") @Getter @Setter @NoArgsConstructor
public class Bundle {
 @Id private String id; @Column(nullable=false) private String name; @Column(nullable=false) private String description;
 @Column(name="price_paise",nullable=false) private int pricePaise; @Column(name="activity_ids",nullable=false,columnDefinition="TEXT") private String activityIds;
 @Column(nullable=false) private boolean active=true;
}
