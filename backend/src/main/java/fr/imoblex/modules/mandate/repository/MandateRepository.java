package fr.imoblex.modules.mandate.repository;

import fr.imoblex.modules.mandate.entity.Mandate;
import fr.imoblex.modules.mandate.enums.MandateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MandateRepository extends JpaRepository<Mandate, UUID> {

    Optional<Mandate> findByMandateNumber(String mandateNumber);

    boolean existsByMandateNumber(String mandateNumber);

    Page<Mandate> findByStatus(MandateStatus status, Pageable pageable);

    Page<Mandate> findByProperty_Id(UUID propertyId, Pageable pageable);

    Page<Mandate> findByAgent_Id(UUID agentId, Pageable pageable);

    long countByStatus(MandateStatus status);

    @Query("SELECT m FROM Mandate m LEFT JOIN FETCH m.property p WHERE m.status = 'ACTIVE' AND m.endDate BETWEEN :now AND :cutoff ORDER BY m.endDate ASC")
    List<Mandate> findExpiringMandates(LocalDate now, LocalDate cutoff);

    @Query("SELECT MAX(CAST(SUBSTRING(m.mandateNumber, 4) AS long)) FROM Mandate m WHERE m.mandateNumber LIKE 'MND%'")
    Optional<Long> findMaxMandateNumber();
}
