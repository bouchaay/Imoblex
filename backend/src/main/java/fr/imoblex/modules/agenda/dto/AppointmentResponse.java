package fr.imoblex.modules.agenda.dto;

import fr.imoblex.modules.agenda.entity.Appointment.AppointmentStatus;
import fr.imoblex.modules.agenda.entity.Appointment.AppointmentType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class AppointmentResponse {
    private UUID id;
    private String title;
    private String description;
    private AppointmentType type;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private UUID agentId;
    private String agentName;
    private UUID contactId;
    private String contactName;
    private UUID propertyId;
    private String propertyReference;
    private String location;
    private Boolean confirmed;
    private Boolean reminderSent;
    private AppointmentStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
