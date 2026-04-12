package fr.imoblex.modules.rental.entity;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.rental.enums.*;
import fr.imoblex.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rental_leases")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RentalLease {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Contact tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id")
    private Contact landlord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    @Enumerated(EnumType.STRING)
    @Column(name = "lease_type", nullable = false)
    private LeaseType leaseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaseStatus status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "rent_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal rentAmount;

    @Column(name = "charges_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal chargesAmount;

    @Column(name = "deposit_amount", precision = 12, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "payment_day_of_month")
    private Integer paymentDayOfMonth;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "renewal_date")
    private LocalDate renewalDate;

    @Column(length = 3000)
    private String notes;

    @OneToMany(mappedBy = "lease", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("paymentYear DESC, paymentMonth DESC")
    private List<RentalPayment> payments = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = LeaseStatus.PENDING;
        if (leaseType == null) leaseType = LeaseType.UNFURNISHED;
        if (chargesAmount == null) chargesAmount = BigDecimal.ZERO;
        if (paymentDayOfMonth == null) paymentDayOfMonth = 1;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public BigDecimal getTotalRent() {
        return rentAmount.add(chargesAmount != null ? chargesAmount : BigDecimal.ZERO);
    }
}
