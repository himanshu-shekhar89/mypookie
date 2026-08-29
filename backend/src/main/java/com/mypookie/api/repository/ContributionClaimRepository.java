package com.mypookie.api.repository;

import com.mypookie.api.model.ContributionClaim;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ContributionClaimRepository extends JpaRepository<ContributionClaim,String> {
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select claim from ContributionClaim claim where claim.claimToken=:token")
 Optional<ContributionClaim> findByClaimTokenForUpdate(@Param("token") String token);
}
