package com.mypookie.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name="coupon")
@Getter @Setter @NoArgsConstructor
public class Coupon {
 @Id private String id;
 @Column(nullable=false,unique=true) private String code;
 @Column(name="discount_type",nullable=false) private String discountType;
 @Column(name="discount_value",nullable=false) private int discountValue;
 @Column(name="max_discount_paise") private Integer maxDiscountPaise;
 @Column(name="min_order_paise",nullable=false) private int minOrderPaise;
 @Column(name="usage_limit") private Integer usageLimit;
 @Column(name="used_count",nullable=false) private int usedCount;
 @Column(name="coupon_type",nullable=false) private String couponType="STANDARD";
 @Column(name="commission_paise_per_use",nullable=false) private int commissionPaisePerUse;
 @Column(name="valid_from") private Instant validFrom;
 @Column(name="expires_at") private Instant expiresAt;
 @Column(nullable=false) private boolean active=true;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="updated_at",nullable=false) private Instant updatedAt=Instant.now();
 @Transient public int getCommissionOwedPaise(){return "INFLUENCER".equals(couponType)?usedCount*commissionPaisePerUse:0;}
}
