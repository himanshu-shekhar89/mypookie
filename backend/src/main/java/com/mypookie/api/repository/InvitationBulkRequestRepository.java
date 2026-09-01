package com.mypookie.api.repository;
import com.mypookie.api.model.InvitationBulkRequest;import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;
public interface InvitationBulkRequestRepository extends JpaRepository<InvitationBulkRequest,String>{List<InvitationBulkRequest> findAllByOrderByCreatedAtDesc();}
