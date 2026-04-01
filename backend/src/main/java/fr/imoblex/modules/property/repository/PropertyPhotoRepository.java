package fr.imoblex.modules.property.repository;

import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.entity.PropertyPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PropertyPhotoRepository extends JpaRepository<PropertyPhoto, UUID> {
    long countByProperty(Property property);
    List<PropertyPhoto> findByPropertyOrderByPositionAsc(Property property);
    void deleteByProperty(Property property);
}
