package com.mypookie.api.model;
import jakarta.persistence.*; import lombok.*;
@Entity @Table(name="activity_type") @Getter @Setter @NoArgsConstructor
public class ActivityType {
 @Id private String id; @Column(nullable=false) private String name; @Column(nullable=false) private String description;
 @Column(name="price_paise",nullable=false) private int pricePaise; @Column(nullable=false) private boolean active=true;
 @Column(name="config_schema",columnDefinition="TEXT") private String configSchema;
}
