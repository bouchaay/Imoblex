package fr.imoblex.modules.rental.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class RentalLeaseRequest {
    private UUID propertyId;
    private UUID tenantId;
    private UUID landlordId;
    private UUID agentId;
    private String leaseType;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal rentAmount;
    private BigDecimal chargesAmount;
    private BigDecimal depositAmount;
    private Integer paymentDayOfMonth;
    private String paymentMethod;
    private LocalDate renewalDate;
    private String notes;
}
