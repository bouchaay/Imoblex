package fr.imoblex.modules.transaction.dto;

import fr.imoblex.modules.transaction.entity.Transaction.TransactionStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class TransactionResponse {
    private UUID id;
    private UUID propertyId;
    private String propertyReference;
    private String propertyAddress;
    private UUID mandateId;
    private UUID buyerId;
    private String buyerName;
    private UUID sellerId;
    private String sellerName;
    private UUID agentId;
    private String agentName;
    private TransactionStatus status;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
