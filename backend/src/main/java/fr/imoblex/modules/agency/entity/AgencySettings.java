package fr.imoblex.modules.agency.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agency_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgencySettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String representativeName;
    private String address;
    private String city;
    private String postalCode;
    private String email;
    private String phone;
    private String website;
    private String siret;
    private String professionalCardNumber;
    private String prefecture;
    private String guaranteeAmount;
    private String guaranteeInsurer;
    private String signatureImagePath;
    private String logoPath;

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
}
