package fr.imoblex.modules.transaction.dto;

import fr.imoblex.modules.transaction.entity.Transaction.TransactionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TransactionRequest {
    @NotNull private UUID propertyId;
    private UUID mandateId;
    private UUID buyerId;
    private UUID sellerId;
    private UUID agentId;
    @NotNull private TransactionStatus status;
    private BigDecimal offerPrice;
    private BigDecimal agreedPrice;
    private BigDecimal agencyFees;
    private BigDecimal netSellerPrice;
    private LocalDate offerDate;
    private LocalDate acceptanceDate;
    private LocalDate compromisDate;
    private LocalDate acteDate;
    private LocalDate completionDate;
    private String notaryBuyer;
    private String notarySeller;
    private String notaryOffice;
    private Boolean loanCondition;
    private BigDecimal loanAmount;
    private Integer loanDurationMonths;
    private BigDecimal loanRate;
    private String notes;
}
