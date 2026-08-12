package com.mypookie.api.repository;
import com.mypookie.api.model.Invitation; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface InvitationRepository extends JpaRepository<Invitation,String>{
 List<Invitation> findByCreatorIdOrderByUpdatedAtDesc(String creatorId);
 Optional<Invitation> findByShareTokenAndStatus(String shareToken,String status);
}
