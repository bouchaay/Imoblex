package fr.imoblex.modules.property.repository;

import fr.imoblex.modules.property.entity.PropertyTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface PropertyTransportRepository extends JpaRepository<PropertyTransport, UUID> {
    List<PropertyTransport> findByPropertyIdOrderByDisplayOrderAsc(UUID propertyId);
    @Modifying
    @Query("DELETE FROM PropertyTransport t WHERE t.property.id = :propertyId")
    void deleteByPropertyId(UUID propertyId);
}
