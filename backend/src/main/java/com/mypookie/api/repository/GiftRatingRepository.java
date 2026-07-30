package com.mypookie.api.repository;

import com.mypookie.api.model.GiftRating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GiftRatingRepository extends JpaRepository<GiftRating,String> {
 Optional<GiftRating> findByGiftId(String giftId);
}
