package com.mypookie.api.repository;

import com.mypookie.api.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon,String> {
 Optional<Coupon> findByCodeIgnoreCase(String code);
}
