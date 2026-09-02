package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="career_campaign")
@Getter @Setter @NoArgsConstructor
public class CareerCampaign {
 @Id private String id;
 @Column(nullable=false) private String title;
 @Column(nullable=false,length=500) private String summary;
 @Column(nullable=false) private boolean active=true;
 @Column(name="default_discount_percent",nullable=false) private int defaultDiscountPercent=10;
 @Column(name="default_commission_paise",nullable=false) private int defaultCommissionPaise=1000;
 @Column(name="default_commission_type",nullable=false) private String defaultCommissionType="FIXED";
 @Column(name="default_commission_percent",nullable=false) private int defaultCommissionPercent;
 @Column(name="monthly_earning_cap_paise",nullable=false) private int monthlyEarningCapPaise=10000000;
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
}
