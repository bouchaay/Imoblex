package fr.imoblex.modules.property.dto;

import fr.imoblex.modules.property.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PropertyResponse {

    private UUID id;
    private String reference;

    // Transaction & type
    private TransactionType transactionType;
    private PropertyType propertyType;
    private PropertyStatus status;

    // Localisation
    private String address;
    private String addressComplement;
    private String city;
    private String postalCode;
    private String department;
    private String region;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean addressVisible;

    // Prix
    private BigDecimal price;
    private BigDecimal pricePerSqm;
    private BigDecimal rentCharges;
    private BigDecimal rentDeposit;
    private Boolean priceNegotiable;
    private Boolean chargesIncluded;
    private BigDecimal agencyFees;
    private String agencyFeesInfo;

    // Surfaces & pièces
    private BigDecimal livingArea;
    private BigDecimal totalArea;
    private BigDecimal landArea;
    private Integer rooms;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer toilets;
    private Integer floor;
    private Integer totalFloors;
    private Integer parkingSpaces;

    // Description
    private String description;
    private String shortDescription;

    // Caractéristiques
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
    private Boolean furnished;
    private Boolean accessible;

    // Chauffage
    private HeatingType heatingType;
    private HeatingEnergy heatingEnergy;

    // DPE
    private String dpeClass;
    private String gesClass;
    private BigDecimal dpeValue;
    private BigDecimal gesValue;
    private LocalDate dpeDoneDate;
    private Boolean dpeExempt;

    // Médias
    private List<PhotoDto> photos;
    private String virtualTourUrl;
    private String videoUrl;
    private String floorPlanUrl;

    // Publication
    private Boolean publishedWebsite;
    private Boolean publishedSeloger;
    private Boolean publishedLeboncoin;
    private Boolean publishedPap;
    private Boolean publishedBienici;
    private LocalDateTime publishedAt;

    // Agent
    private UUID agentId;
    private String agentName;

    // Dates
    private LocalDate availableFrom;
    private LocalDate constructionYear;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Stats
    private Integer viewCount;
    private Integer contactCount;
    private Integer visitCount;

    @Data
    @Builder
    public static class PhotoDto {
        private UUID id;
        private String url;
        private String thumbnailUrl;
        private String caption;
        private Integer position;
    }
}
