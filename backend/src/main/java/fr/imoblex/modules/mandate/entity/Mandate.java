package fr.imoblex.modules.mandate.entity;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.mandate.enums.MandateStatus;
import fr.imoblex.modules.mandate.enums.MandateType;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mandates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mandate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Numéro de mandat légal (séquence par agence)
    @Column(unique = true, nullable = false)
    private String mandateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MandateType type; // SIMPLE, EXCLUSIVE, CO_EXCLUSIVE, SEMI_EXCLUSIVE

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MandateStatus status; // ACTIVE, EXPIRED, CANCELLED, COMPLETED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    // Mandant (propriétaire vendeur/bailleur)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mandator_id", nullable = false)
    private Contact mandator;

    // Agent en charge
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private User agent;

    // Prix de vente/location négocié
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal agreedPrice;

    // Honoraires
    @Column(precision = 10, scale = 2)
    private BigDecimal agencyFees;
    private BigDecimal agencyFeesPercent;
    private String feesChargedTo; // SELLER, BUYER, SHARED

    // Durée du mandat
    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private LocalDate renewalDate;

    // Signature
    private LocalDate signedAt;
    private String signedAtPlace;
    private String signatureUrl; // URL du document signé

    // Notes internes
    @Column(length = 2000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDate.now().isAfter(endDate);
    }

    public boolean isExpiringSoon() {
        return LocalDate.now().isAfter(endDate.minusDays(30));
    }
}
