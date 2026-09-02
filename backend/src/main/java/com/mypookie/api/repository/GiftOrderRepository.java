package com.mypookie.api.repository;
import com.mypookie.api.model.GiftOrder; import org.springframework.data.jpa.repository.JpaRepository; import org.springframework.data.jpa.repository.Lock; import org.springframework.data.jpa.repository.Query; import org.springframework.data.repository.query.Param; import jakarta.persistence.LockModeType; import java.util.*;
public interface GiftOrderRepository extends JpaRepository<GiftOrder,String>{
 List<GiftOrder> findBySenderIdOrderByCreatedAtDesc(String senderId);
 List<GiftOrder> findByCouponCodeIgnoreCaseAndStatusOrderByCreatedAtAsc(String couponCode,String status);
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select giftOrder from GiftOrder giftOrder where giftOrder.id=:id")
 Optional<GiftOrder> findByIdForUpdate(@Param("id") String id);
}
