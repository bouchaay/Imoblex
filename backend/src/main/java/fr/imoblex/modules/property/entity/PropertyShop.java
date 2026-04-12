package fr.imoblex.modules.property.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "property_shops")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PropertyShop {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private String type; // SUPERMARKET, BAKERY, PHARMACY, SCHOOL, PARK, RESTAURANT, BANK, HOSPITAL, OTHER

    private String name;

    @Column(name = "distance_meters")
    private Integer distanceMeters;

    @Column(name = "walking_minutes")
    private Integer walkingMinutes;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
