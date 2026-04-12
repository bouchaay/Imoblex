package fr.imoblex.modules.rental.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RentalPaymentResponse {
    private UUID id;
    private UUID leaseId;
    private Integer paymentMonth;
    private Integer paymentYear;
    private BigDecimal expectedAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private LocalDate paymentDate;
    private LocalDate dueDate;
    private String status;
    private String paymentMethod;
    private String reference;
    private String notes;
    private LocalDateTime quittanceGeneratedAt;
    private LocalDateTime createdAt;
}
