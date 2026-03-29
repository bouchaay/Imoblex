package fr.imoblex.modules.property.dto;

import fr.imoblex.modules.property.enums.PropertyStatus;
import fr.imoblex.modules.property.enums.PropertyType;
import fr.imoblex.modules.property.enums.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PropertySearchRequest {
    private TransactionType transactionType;
    private PropertyType propertyType;
    private PropertyStatus status;
    private String city;
    private String postalCode;
    private BigDecimal priceMin;
    private BigDecimal priceMax;
    private BigDecimal areaMin;
    private BigDecimal areaMax;
    private Integer roomsMin;
    private Integer roomsMax;
    private Integer bedroomsMin;
    private Boolean hasParking;
    private Boolean hasGarden;
    private Boolean hasPool;
    private Boolean hasElevator;
    private Boolean hasBalcony;
    private Boolean hasTerrace;
    private Boolean furnished;
    private UUID agentId;
    private String keyword;
    private boolean publicSearch = false; // true = site public (filtre published + available)

    // Pagination et tri
    private int page = 0;
    private int size = 12;
    private String sortBy = "createdAt";
    private String sortDir = "DESC";
}
