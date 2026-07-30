package com.mypookie.api.repository;

import com.mypookie.api.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon,String> {
 Optional<Coupon> findByCodeIgnoreCase(String code);

 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select coupon from Coupon coupon where upper(coupon.code)=upper(:code)")
 Optional<Coupon> findByCodeIgnoreCaseForUpdate(@Param("code") String code);
}
