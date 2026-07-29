package com.mypookie.api.repository;

import com.mypookie.api.model.ContributionInvite;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ContributionInviteRepository extends JpaRepository<ContributionInvite,String> {
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select invite from ContributionInvite invite where invite.token=:token")
 Optional<ContributionInvite> findByTokenForUpdate(@Param("token") String token);
}
