package com.mypookie.api.repository;
import com.mypookie.api.model.Gift; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface GiftRepository extends JpaRepository<Gift,String>{ List<Gift> findBySenderIdOrderByUpdatedAtDesc(String senderId); Optional<Gift> findByShareToken(String token); }
