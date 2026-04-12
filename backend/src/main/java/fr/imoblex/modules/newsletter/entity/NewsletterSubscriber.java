package fr.imoblex.modules.newsletter.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "newsletter_subscribers")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    private String city;

    @Column(name = "transaction_type")
    private String transactionType; // SALE, RENT, BOTH

    @Column(name = "min_budget")
    private Integer minBudget;

    @Column(name = "max_budget")
    private Integer maxBudget;

    @Column(name = "property_types", length = 500)
    private String propertyTypes; // comma-separated

    @Column(name = "gdpr_consent", nullable = false)
    private Boolean gdprConsent;

    @Column(name = "gdpr_consent_date")
    private LocalDateTime gdprConsentDate;

    @Column(name = "unsubscribe_token", unique = true)
    private String unsubscribeToken;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "unsubscribed_at")
    private LocalDateTime unsubscribedAt;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (unsubscribeToken == null) unsubscribeToken = UUID.randomUUID().toString();
    }
}
