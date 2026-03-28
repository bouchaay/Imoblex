package fr.imoblex.modules.agenda.entity;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentType type; // VISIT, MEETING, SIGNING, PHONE, OTHER

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private User agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

    private String location;          // Lieu du RDV
    private Boolean confirmed;        // Confirmé par le client
    private Boolean reminderSent;     // Rappel envoyé

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status; // PLANNED, CONFIRMED, DONE, CANCELLED

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (confirmed == null) confirmed = false;
        if (reminderSent == null) reminderSent = false;
        if (status == null) status = AppointmentStatus.PLANNED;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AppointmentType {
        VISIT,    // Visite du bien
        MEETING,  // Réunion
        SIGNING,  // Signature (mandat, compromis...)
        PHONE,    // Appel téléphonique
        OTHER     // Autre
    }

    public enum AppointmentStatus {
        PLANNED,    // Planifié
        CONFIRMED,  // Confirmé
        DONE,       // Effectué
        CANCELLED   // Annulé
    }
}
