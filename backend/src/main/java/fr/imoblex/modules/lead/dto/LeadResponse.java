package fr.imoblex.modules.lead.dto;

import fr.imoblex.modules.lead.entity.LeadStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LeadResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String message;
    private String propertyReference;
    private String source;
    private String formType;
    private LeadStatus status;
    private boolean archived;
    private boolean gdprConsent;
    private LocalDateTime readAt;
    private LocalDateTime archivedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
