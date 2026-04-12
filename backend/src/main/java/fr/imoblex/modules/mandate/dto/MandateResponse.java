package fr.imoblex.modules.mandate.dto;

import fr.imoblex.modules.mandate.enums.MandateCategory;
import fr.imoblex.modules.mandate.enums.MandateStatus;
import fr.imoblex.modules.mandate.enums.MandateType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class MandateResponse {
    private UUID id;
    private String mandateNumber;
    private MandateCategory category;
    private MandateType type;
    private MandateStatus status;
    private UUID propertyId;
    private String propertyReference;
    private String propertyAddress;
    private UUID mandatorId;
    private String mandatorName;
    private UUID agentId;
    private String agentName;
    private BigDecimal agreedPrice;
    private BigDecimal agencyFees;
    private BigDecimal agencyFeesPercent;
    private String agencyFeesText;
    private String feesChargedTo;
    private Integer maxDurationYears;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate renewalDate;
    private LocalDate signedAt;
    private String signedAtPlace;
    private String notes;
    private boolean expired;
    private boolean expiringSoon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
