package com.mypookie.api.repository;

import com.mypookie.api.model.GiftSecret;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface GiftSecretRepository extends JpaRepository<GiftSecret,String> {
 Optional<GiftSecret> findByGiftIdAndBlockInstanceId(String giftId,String blockInstanceId);
 List<GiftSecret> findByGiftId(String giftId);
 void deleteByGiftIdAndBlockInstanceId(String giftId,String blockInstanceId);
}
