package fr.imoblex.modules.property.repository;

import fr.imoblex.modules.property.entity.PropertyShop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface PropertyShopRepository extends JpaRepository<PropertyShop, UUID> {
    List<PropertyShop> findByPropertyIdOrderByDisplayOrderAsc(UUID propertyId);
    @Modifying
    @Query("DELETE FROM PropertyShop s WHERE s.property.id = :propertyId")
    void deleteByPropertyId(UUID propertyId);
}
