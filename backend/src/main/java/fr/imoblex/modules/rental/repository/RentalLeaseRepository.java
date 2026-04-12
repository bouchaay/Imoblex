package fr.imoblex.modules.rental.repository;

import fr.imoblex.modules.rental.entity.RentalLease;
import fr.imoblex.modules.rental.enums.LeaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RentalLeaseRepository extends JpaRepository<RentalLease, UUID> {
    List<RentalLease> findByTenantIdOrderByStartDateDesc(UUID tenantId);
    List<RentalLease> findByPropertyIdOrderByStartDateDesc(UUID propertyId);
    List<RentalLease> findByStatusOrderByStartDateDesc(LeaseStatus status);
    Optional<RentalLease> findByPropertyIdAndStatus(UUID propertyId, LeaseStatus status);
    boolean existsByPropertyIdAndStatus(UUID propertyId, LeaseStatus status);

    @Query("SELECT l FROM RentalLease l ORDER BY l.createdAt DESC")
    List<RentalLease> findAllOrderByCreatedAtDesc();
}
