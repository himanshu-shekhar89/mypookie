package com.mypookie.api.repository;

import com.mypookie.api.model.GiftOpenSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GiftOpenSessionRepository extends JpaRepository<GiftOpenSession,String> {
 boolean existsByGiftIdAndClientSessionId(String giftId,String clientSessionId);
}
