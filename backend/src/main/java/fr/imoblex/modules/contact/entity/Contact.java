package fr.imoblex.modules.contact.entity;

import fr.imoblex.modules.contact.enums.ContactType;
import fr.imoblex.modules.contact.enums.ContactStatus;
import fr.imoblex.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Civilité
    private String salutation; // M., Mme

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    private String company;      // Entreprise (si professionnel)
    private String email;
    private String phone;
    private String mobile;

    // Adresse
    private String address;
    private String city;
    private String postalCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactType type; // BUYER, SELLER, TENANT, LANDLORD, BOTH

    @Enumerated(EnumType.STRING)
    private ContactStatus status; // PROSPECT, ACTIVE, INACTIVE, LOST

    // Agent référent
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User assignedAgent;

    // Critères de recherche (pour les acheteurs/locataires)
    @OneToOne(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true)
    private SearchCriteria searchCriteria;

    // Historique des interactions
    @OneToMany(mappedBy = "contact", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<ContactInteraction> interactions = new ArrayList<>();

    @Column(length = 2000)
    private String notes;

    // Préférences de contact
    private Boolean acceptsEmail;
    private Boolean acceptsSms;

    // Source du contact
    private String source; // WEBSITE, PHONE, REFERRAL, PORTAL, WALK_IN...

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (acceptsEmail == null) acceptsEmail = true;
        if (acceptsSms == null) acceptsSms = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return (salutation != null ? salutation + " " : "") + firstName + " " + lastName;
    }
}
