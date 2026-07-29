package com.mypookie.api.repository;
import com.mypookie.api.model.ActivityType; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ActivityTypeRepository extends JpaRepository<ActivityType,String>{ List<ActivityType> findByActiveTrue(); }
