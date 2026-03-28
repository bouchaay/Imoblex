package fr.imoblex.modules.contact.entity;

import fr.imoblex.modules.property.enums.PropertyType;
import fr.imoblex.modules.property.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "search_criteria")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    private PropertyType propertyType;

    // Budget
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;

    // Surface
    private Double areaMin;
    private Double areaMax;

    // Pièces
    private Integer roomsMin;
    private Integer roomsMax;
    private Integer bedroomsMin;

    // Localisation
    private String cities;           // CSV des villes
    private String postalCodes;      // CSV des codes postaux
    private Double radiusKm;         // Rayon de recherche en km
    private Double centerLatitude;
    private Double centerLongitude;

    // Critères optionnels
    private Boolean wantsGarden;
    private Boolean wantsParking;
    private Boolean wantsElevator;
    private Boolean wantsBalcony;
    private Boolean wantsTerrace;
    private Boolean wantsPool;
    private Boolean wantsFurnished;

    // Alerte email active
    private Boolean alertActive;
    private String alertFrequency; // IMMEDIATE, DAILY, WEEKLY

    @Column(length = 1000)
    private String additionalNotes;
}
