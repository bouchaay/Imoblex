package fr.imoblex.modules.contact.entity;

import fr.imoblex.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contact_interactions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", nullable = false)
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InteractionType type; // CALL, EMAIL, VISIT, MEETING, NOTE, SMS

    @Column(nullable = false, length = 2000)
    private String content;

    private String relatedPropertyRef; // Référence du bien concerné

    private LocalDateTime scheduledAt;  // Pour les RDV planifiés

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum InteractionType {
        CALL, EMAIL, VISIT, MEETING, NOTE, SMS, OFFER
    }
}
