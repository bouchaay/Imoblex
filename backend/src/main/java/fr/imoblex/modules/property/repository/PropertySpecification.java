package fr.imoblex.modules.property.repository;

import fr.imoblex.modules.property.dto.PropertySearchRequest;
import fr.imoblex.modules.property.entity.Property;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PropertySpecification {

    public static Specification<Property> buildSpec(PropertySearchRequest req) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (req.getTransactionType() != null) {
                predicates.add(cb.equal(root.get("transactionType"), req.getTransactionType()));
            }
            if (req.getPropertyType() != null) {
                predicates.add(cb.equal(root.get("propertyType"), req.getPropertyType()));
            }
            if (req.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), req.getStatus()));
            } else {
                // Par défaut : seulement les biens disponibles pour la recherche publique
                if (req.isPublicSearch()) {
                    predicates.add(cb.equal(root.get("status"), "AVAILABLE"));
                    predicates.add(cb.isTrue(root.get("publishedWebsite")));
                }
            }
            if (req.getCity() != null && !req.getCity().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("city")), "%" + req.getCity().toLowerCase() + "%"));
            }
            if (req.getPostalCode() != null && !req.getPostalCode().isBlank()) {
                predicates.add(cb.like(root.get("postalCode"), req.getPostalCode() + "%"));
            }
            if (req.getPriceMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), req.getPriceMin()));
            }
            if (req.getPriceMax() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), req.getPriceMax()));
            }
            if (req.getAreaMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("livingArea"), req.getAreaMin()));
            }
            if (req.getAreaMax() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("livingArea"), req.getAreaMax()));
            }
            if (req.getRoomsMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rooms"), req.getRoomsMin()));
            }
            if (req.getBedroomsMin() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bedrooms"), req.getBedroomsMin()));
            }
            if (Boolean.TRUE.equals(req.getHasParking())) {
                predicates.add(cb.isTrue(root.get("parking")));
            }
            if (Boolean.TRUE.equals(req.getHasGarden())) {
                predicates.add(cb.isTrue(root.get("garden")));
            }
            if (Boolean.TRUE.equals(req.getHasPool())) {
                predicates.add(cb.isTrue(root.get("pool")));
            }
            if (Boolean.TRUE.equals(req.getHasElevator())) {
                predicates.add(cb.isTrue(root.get("elevator")));
            }
            if (req.getAgentId() != null) {
                predicates.add(cb.equal(root.get("agent").get("id"), req.getAgentId()));
            }
            if (req.getKeyword() != null && !req.getKeyword().isBlank()) {
                String kw = "%" + req.getKeyword().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("description")), kw),
                    cb.like(cb.lower(root.get("city")), kw),
                    cb.like(cb.lower(root.get("reference")), kw)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
