package fr.imoblex.modules.mandate.dto;

import fr.imoblex.modules.mandate.enums.MandateStatus;
import fr.imoblex.modules.mandate.enums.MandateType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class MandateRequest {
    @NotNull private MandateType type;
    private MandateStatus status;
    @NotNull private UUID propertyId;
    @NotNull private UUID mandatorId;
    @NotNull private UUID agentId;
    @NotNull private BigDecimal agreedPrice;
    private BigDecimal agencyFees;
    private BigDecimal agencyFeesPercent;
    private String feesChargedTo;
    @NotNull private LocalDate startDate;
    @NotNull private LocalDate endDate;
    private LocalDate renewalDate;
    private LocalDate signedAt;
    private String signedAtPlace;
    private String notes;
}
