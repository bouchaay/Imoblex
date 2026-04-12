package fr.imoblex.modules.property.dto;

import fr.imoblex.modules.property.enums.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class PropertyCreateRequest {

    @NotNull
    private TransactionType transactionType;

    @NotNull
    private PropertyType propertyType;

    private PropertyStatus status = PropertyStatus.AVAILABLE;

    // Localisation
    @NotBlank
    private String address;
    private String addressComplement;
    @NotBlank
    private String city;
    @NotBlank
    private String postalCode;
    private String department;
    private String region;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean addressVisible = true;

    // Prix
    @NotNull
    @Positive
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
    private String virtualTourUrl;
    private String videoUrl;
    private String floorPlanUrl;

    // Publication
    private Boolean publishedWebsite = false;
    private Boolean publishedSeloger;
    private Boolean publishedLeboncoin;
    private Boolean publishedPap;
    private Boolean publishedBienici;

    // Agent assigné
    private UUID agentId;

    // Propriétaire / contact associé (vendeur, bailleur...)
    private UUID ownerId;

    // Dates
    private LocalDate availableFrom;
    private LocalDate constructionYear;

    // Proximité
    private List<TransportDto> transports;
    private List<ShopDto> shops;

    @Data
    public static class TransportDto {
        private String type;
        private String line;
        private String name;
        private Integer distanceMeters;
        private Integer walkingMinutes;
        private Integer displayOrder;
    }

    @Data
    public static class ShopDto {
        private String type;
        private String name;
        private Integer distanceMeters;
        private Integer walkingMinutes;
        private Integer displayOrder;
    }
}
