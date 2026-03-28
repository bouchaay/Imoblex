package fr.imoblex.modules.property.repository;

import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.enums.PropertyStatus;
import fr.imoblex.modules.property.enums.PropertyType;
import fr.imoblex.modules.property.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID>, JpaSpecificationExecutor<Property> {

    Optional<Property> findByReference(String reference);

    boolean existsByReference(String reference);

    Page<Property> findByPublishedWebsiteTrue(Pageable pageable);

    Page<Property> findByTransactionTypeAndStatusAndPublishedWebsiteTrue(
        TransactionType transactionType,
        PropertyStatus status,
        Pageable pageable
    );

    long countByStatus(PropertyStatus status);

    long countByTransactionType(TransactionType type);

    @Modifying
    @Query("UPDATE Property p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    void incrementViewCount(UUID id);

    @Query("SELECT COUNT(p) FROM Property p WHERE p.agent.id = :agentId AND p.status = 'AVAILABLE'")
    long countAvailableByAgent(UUID agentId);

    // Génération de la prochaine référence
    @Query("SELECT MAX(CAST(SUBSTRING(p.reference, 4) AS long)) FROM Property p WHERE p.reference LIKE 'IMB%'")
    Optional<Long> findMaxReferenceNumber();
}
