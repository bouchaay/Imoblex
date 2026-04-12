package fr.imoblex.modules.rental.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RentalPaymentRequest {
    private Integer paymentMonth;
    private Integer paymentYear;
    private BigDecimal expectedAmount;
    private BigDecimal paidAmount;
    private LocalDate paymentDate;
    private LocalDate dueDate;
    private String paymentMethod;
    private String reference;
    private String notes;
}
