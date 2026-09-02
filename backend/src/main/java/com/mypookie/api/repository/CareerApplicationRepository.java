package com.mypookie.api.repository;
import com.mypookie.api.model.CareerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface CareerApplicationRepository extends JpaRepository<CareerApplication,String> {
 List<CareerApplication> findAllByOrderByCreatedAtDesc();
 Optional<CareerApplication> findFirstByFirebaseUidOrderByCreatedAtDesc(String firebaseUid);
 boolean existsByEmailIgnoreCaseAndCampaignIdAndStatusIn(String email,String campaignId,List<String> statuses);
}
