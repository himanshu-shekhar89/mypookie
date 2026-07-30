package com.mypookie.api.controller;

import com.mypookie.api.dto.CouponRequest;
import com.mypookie.api.model.*;
import com.mypookie.api.repository.*;
import com.mypookie.api.service.RazorpayService;
import com.mypookie.api.service.FirebaseAuthenticationFilter.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
 private final CouponRepository coupons;
 private final ActivityTypeRepository activities;
 private final BundleRepository bundles;
 private final GiftRepository gifts;
 private final GiftOrderRepository orders;
 private final AppUserRepository users;
 private final ExperienceResponseRepository responses;
 private final ContributionInviteRepository invites;
 private final RazorpayService razorpay;
 @Value("${app.auth.firebase-enabled:false}") private boolean firebaseEnabled;
 @Value("${app.groq.api-key:}") private String groqKey;
 @Value("${app.auth.super-admin-emails:himaanshushekharr.pvt@gmail.com,himanshushekharr.pvt@gmail.com}") private String superAdminEmails;

 @GetMapping("/overview")
 public Map<String,Object> overview(){
  var allOrders=orders.findAll();
  long paidOrders=allOrders.stream().filter(order->Set.of("PAID","PAID_DEMO","PAID_FREE").contains(order.getStatus())).count();
  int revenue=allOrders.stream().filter(order->Set.of("PAID","PAID_DEMO","PAID_FREE").contains(order.getStatus())).mapToInt(GiftOrder::getAmountPaise).sum();
  return Map.of(
   "users",users.count(),"gifts",gifts.count(),"orders",orders.count(),"paidOrders",paidOrders,
   "revenuePaise",revenue,"responses",responses.count(),"activeCoupons",coupons.findAll().stream().filter(Coupon::isActive).count(),
   "integrations",Map.of("firebase",firebaseEnabled,"groq",groqKey!=null&&!groqKey.isBlank(),"razorpay",razorpay.configured())
  );
 }

 @GetMapping("/coupons")
 public List<Coupon> coupons(){return coupons.findAll().stream().sorted(Comparator.comparing(Coupon::getCreatedAt).reversed()).toList();}

 @PostMapping("/coupons")
 public Coupon createCoupon(@Valid @RequestBody CouponRequest request){
  if(coupons.findByCodeIgnoreCase(request.code()).isPresent())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Coupon code already exists");
  var coupon=new Coupon();coupon.setId(UUID.randomUUID().toString());apply(coupon,request);return coupons.save(coupon);
 }

 @PutMapping("/coupons/{id}")
 public Coupon updateCoupon(@PathVariable String id,@Valid @RequestBody CouponRequest request){
  var coupon=coupons.findById(id).orElseThrow();apply(coupon,request);return coupons.save(coupon);
 }

 @DeleteMapping("/coupons/{id}")
 public void disableCoupon(@PathVariable String id){var coupon=coupons.findById(id).orElseThrow();coupon.setActive(false);coupon.setUpdatedAt(Instant.now());coupons.save(coupon);}

 @GetMapping("/activities")
 public List<ActivityType> activities(){return activities.findAll().stream().sorted(Comparator.comparing(ActivityType::getName)).toList();}

 @PutMapping("/activities/{id}")
 public ActivityType updateActivity(@PathVariable String id,@Valid @RequestBody ActivityUpdate request){
  var activity=activities.findById(id).orElseThrow();activity.setName(request.name());activity.setDescription(request.description());activity.setPricePaise(request.pricePaise());activity.setActive(request.active());return activities.save(activity);
 }

 @GetMapping("/bundles")
 public List<Bundle> bundles(){return bundles.findAll().stream().sorted(Comparator.comparing(Bundle::getRecipientType).thenComparing(Bundle::getName)).toList();}

 @PutMapping("/bundles/{id}")
 public Bundle updateBundle(@PathVariable String id,@Valid @RequestBody BundleUpdate request){
  var bundle=bundles.findById(id).orElseThrow();bundle.setName(request.name());bundle.setDescription(request.description());bundle.setPricePaise(request.pricePaise());bundle.setActivityIds(request.activityIds());bundle.setRecipientType(request.recipientType());bundle.setActive(request.active());return bundles.save(bundle);
 }

 @GetMapping("/gifts")
 public List<Gift> gifts(){return gifts.findAll().stream().sorted(Comparator.comparing(Gift::getUpdatedAt).reversed()).limit(200).toList();}

 @GetMapping("/orders")
 public List<GiftOrder> orders(){return orders.findAll().stream().sorted(Comparator.comparing(GiftOrder::getCreatedAt).reversed()).limit(200).toList();}

 @GetMapping("/users")
 public List<AppUser> users(){return users.findAll().stream().sorted(Comparator.comparing(AppUser::getCreatedAt).reversed()).limit(200).toList();}

 @PutMapping("/users/{id}/role")
 public AppUser role(@PathVariable String id,@RequestBody RoleUpdate request,@AuthenticationPrincipal UserPrincipal principal){
  if(principal==null||!isSuperAdmin(principal.email()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Only a root administrator can change admin access");
  if(!Set.of("USER","ADMIN").contains(request.role()))throw new IllegalArgumentException("Invalid role");
  var user=users.findById(id).orElseThrow();
  if(isSuperAdmin(user.getEmail())&&!"ADMIN".equals(request.role()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Root administrator access cannot be removed");
  user.setRole(request.role());return users.save(user);
 }

 @GetMapping("/invites")
 public List<ContributionInvite> invites(){return invites.findAll().stream().sorted(Comparator.comparing(ContributionInvite::getCreatedAt).reversed()).limit(200).toList();}

 private void apply(Coupon coupon,CouponRequest request){
  coupon.setCode(request.code().trim().toUpperCase());coupon.setDiscountType(request.discountType());coupon.setDiscountValue(request.discountValue());
  coupon.setMaxDiscountPaise(request.maxDiscountPaise());coupon.setMinOrderPaise(request.minOrderPaise());coupon.setUsageLimit(request.usageLimit());
  coupon.setValidFrom(request.validFrom());coupon.setExpiresAt(request.expiresAt());coupon.setActive(request.active());coupon.setUpdatedAt(Instant.now());
 }
 private boolean isSuperAdmin(String email){
  if(email==null)return false;
  return Arrays.stream(superAdminEmails.split(",")).map(String::trim).anyMatch(candidate->candidate.equalsIgnoreCase(email));
 }

 public record ActivityUpdate(@jakarta.validation.constraints.NotBlank String name,@jakarta.validation.constraints.NotBlank String description,@jakarta.validation.constraints.PositiveOrZero int pricePaise,boolean active){}
 public record BundleUpdate(@jakarta.validation.constraints.NotBlank String name,@jakarta.validation.constraints.NotBlank String description,@jakarta.validation.constraints.PositiveOrZero int pricePaise,@jakarta.validation.constraints.NotBlank String activityIds,@jakarta.validation.constraints.Pattern(regexp="Lover|Friend|Parents|Sibling|Other") String recipientType,boolean active){}
 public record RoleUpdate(String role){}
}
