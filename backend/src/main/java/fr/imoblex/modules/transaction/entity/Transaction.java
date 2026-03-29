package fr.imoblex.modules.transaction.entity;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.mandate.entity.Mandate;
import fr.imoblex.modules.property.entity.Property;
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
@Table(name = "transactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mandate_id")
    private Mandate mandate;

    // Acheteur / Locataire
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private Contact buyer;

    // Vendeur / Bailleur
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private Contact seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    // Montants
    @Column(precision = 12, scale = 2)
    private BigDecimal offerPrice;       // Prix offre

    @Column(precision = 12, scale = 2)
    private BigDecimal agreedPrice;      // Prix accepté

    @Column(precision = 12, scale = 2)
    private BigDecimal agencyFees;       // Honoraires agence

    @Column(precision = 12, scale = 2)
    private BigDecimal netSellerPrice;   // Net vendeur

    // Dates clés
    private LocalDate offerDate;
    private LocalDate acceptanceDate;
    private LocalDate compromisDate;
    private LocalDate acteDate;          // Date acte authentique prévisionnelle
    private LocalDate completionDate;    // Date de réalisation effective

    // Notaire
    private String notaryBuyer;
    private String notarySeller;
    private String notaryOffice;

    // Conditions suspensives
    private Boolean loanCondition;      // Condition suspensive de prêt
    private BigDecimal loanAmount;
    private Integer loanDurationMonths;
    @Column(precision = 5, scale = 3)
    private BigDecimal loanRate;

    // Étapes
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<TransactionStep> steps = new ArrayList<>();

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

    public enum TransactionStatus {
        OFFER,          // Offre en cours
        ACCEPTED,       // Offre acceptée
        COMPROMIS,      // Compromis signé
        FINANCING,      // En attente financement
        ACTE,           // Acte en cours
        COMPLETED,      // Réalisée
        CANCELLED       // Annulée
    }
}
