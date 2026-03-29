package fr.imoblex.modules.property.entity;

import fr.imoblex.modules.property.enums.*;
import fr.imoblex.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Référence interne unique
    @Column(unique = true, nullable = false)
    private String reference;

    // Type de transaction
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType; // SALE, RENT

    // Type de bien
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType propertyType; // APARTMENT, HOUSE, LAND, COMMERCIAL, PARKING, GARAGE, NEW_PROGRAM

    // Statut du bien
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status; // AVAILABLE, UNDER_OFFER, SOLD, RENTED, WITHDRAWN

    // ===== LOCALISATION =====
    @Column(nullable = false)
    private String address;
    private String addressComplement;
    @Column(nullable = false)
    private String city;
    @Column(nullable = false)
    private String postalCode;
    private String department;
    private String region;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean addressVisible; // Afficher l'adresse complète sur le site ?

    // ===== PRIX =====
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private BigDecimal pricePerSqm;
    private BigDecimal rentCharges;        // Charges (location)
    private BigDecimal rentDeposit;        // Dépôt de garantie
    private Boolean priceNegotiable;
    private Boolean chargesIncluded;
    private BigDecimal agencyFees;
    private String agencyFeesInfo;         // Qui paie les honoraires

    // ===== SURFACES & PIÈCES =====
    private BigDecimal livingArea;         // Surface habitable (m²)
    private BigDecimal totalArea;          // Surface totale
    private BigDecimal landArea;           // Surface terrain
    private Integer rooms;                 // Nombre de pièces
    private Integer bedrooms;             // Chambres
    private Integer bathrooms;            // Salles de bain
    private Integer toilets;             // WC séparés
    private Integer floor;               // Étage
    private Integer totalFloors;         // Nombre d'étages (immeuble)
    private Integer parkingSpaces;       // Places de parking

    // ===== DESCRIPTION =====
    @Column(length = 5000)
    private String description;

    @Column(length = 500)
    private String shortDescription;      // Résumé court pour les cartes

    // ===== CARACTÉRISTIQUES =====
    private Boolean elevator;
    private Boolean balcony;
    private Boolean terrace;
    private Boolean garden;
    private Boolean parking;
    private Boolean garage;
    private Boolean cellar;
    private Boolean pool;
    private Boolean fireplace;
    private Boolean airConditioning;
    private Boolean furnished;            // Meublé (location)
    private Boolean accessible;          // Accessibilité PMR

    // ===== CHAUFFAGE =====
    @Enumerated(EnumType.STRING)
    private HeatingType heatingType;     // ELECTRIC, GAS, OIL, HEAT_PUMP, WOOD, OTHER

    @Enumerated(EnumType.STRING)
    private HeatingEnergy heatingEnergy; // INDIVIDUAL, COLLECTIVE

    // ===== DIAGNOSTICS DPE =====
    private String dpeClass;             // A, B, C, D, E, F, G
    private String gesClass;             // A, B, C, D, E, F, G
    private BigDecimal dpeValue;         // kWh/m²/an
    private BigDecimal gesValue;         // kgCO2/m²/an
    private LocalDate dpeDoneDate;
    private Boolean dpeExempt;           // Dispensé de DPE

    // ===== MÉDIAS =====
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<PropertyPhoto> photos = new ArrayList<>();

    private String virtualTourUrl;       // Lien visite virtuelle 360°
    private String videoUrl;
    private String floorPlanUrl;         // URL du plan

    // ===== PUBLICATION =====
    private Boolean publishedWebsite;    // Publié sur imoblex.fr
    private Boolean publishedSeloger;
    private Boolean publishedLeboncoin;
    private Boolean publishedPap;
    private Boolean publishedBienici;
    private LocalDateTime publishedAt;

    // ===== AGENT =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    // ===== DATES =====
    private LocalDate availableFrom;     // Disponible à partir de
    private LocalDate constructionYear;  // Année de construction

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // ===== STATS =====
    private Integer viewCount;
    private Integer contactCount;
    private Integer visitCount;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        viewCount = 0;
        contactCount = 0;
        visitCount = 0;
        if (publishedWebsite == null) publishedWebsite = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
