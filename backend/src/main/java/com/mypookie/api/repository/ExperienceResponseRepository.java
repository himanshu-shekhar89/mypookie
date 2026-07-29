package com.mypookie.api.repository;

import com.mypookie.api.model.ExperienceResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExperienceResponseRepository extends JpaRepository<ExperienceResponse,String> {
 List<ExperienceResponse> findByGiftIdAndBlockIdOrderByCreatedAtAsc(String giftId,String blockId);
}
