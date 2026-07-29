package com.mypookie.api.model;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Table(name="gift_order") @Getter @Setter @NoArgsConstructor
public class GiftOrder {
 @Id private String id; @Column(name="gift_id",nullable=false) private String giftId; @Column(name="sender_id",nullable=false) private String senderId;
 @Column(name="amount_paise",nullable=false) private int amountPaise; @Column(nullable=false) private String currency="INR";
 @Column(nullable=false) private String status; @Column(name="provider_order_id") private String providerOrderId;
 @Column(name="provider_payment_id") private String providerPaymentId;
 @Column(name="coupon_code") private String couponCode; @Column(name="discount_paise",nullable=false) private int discountPaise;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
}
