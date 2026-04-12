package fr.imoblex.modules.rental.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RentalLeaseResponse {
    private UUID id;
    private UUID propertyId;
    private String propertyReference;
    private String propertyAddress;
    private String propertyCity;
    private UUID tenantId;
    private String tenantName;
    private String tenantEmail;
    private String tenantPhone;
    private UUID landlordId;
    private String landlordName;
    private UUID agentId;
    private String agentName;
    private String leaseType;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal rentAmount;
    private BigDecimal chargesAmount;
    private BigDecimal totalRent;
    private BigDecimal depositAmount;
    private Integer paymentDayOfMonth;
    private String paymentMethod;
    private LocalDate renewalDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Payment summary
    private Integer totalPayments;
    private Integer paidPayments;
    private String currentMonthStatus;
}
