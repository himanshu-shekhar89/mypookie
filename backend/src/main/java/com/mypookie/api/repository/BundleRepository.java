package com.mypookie.api.repository;
import com.mypookie.api.model.Bundle; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface BundleRepository extends JpaRepository<Bundle,String>{ List<Bundle> findByActiveTrue(); }
