package com.mypookie.api.repository;
import com.mypookie.api.model.GiftOrder; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface GiftOrderRepository extends JpaRepository<GiftOrder,String>{
 List<GiftOrder> findBySenderIdOrderByCreatedAtDesc(String senderId);
}
