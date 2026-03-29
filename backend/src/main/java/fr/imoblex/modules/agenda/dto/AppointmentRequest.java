package fr.imoblex.modules.agenda.dto;

import fr.imoblex.modules.agenda.entity.Appointment.AppointmentStatus;
import fr.imoblex.modules.agenda.entity.Appointment.AppointmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentRequest {
    @NotBlank private String title;
    private String description;
    @NotNull private AppointmentType type;
    @NotNull private LocalDateTime startAt;
    @NotNull private LocalDateTime endAt;
    @NotNull private UUID agentId;
    private UUID contactId;
    private UUID propertyId;
    private String location;
    private Boolean confirmed;
    private Boolean reminderSent;
    private AppointmentStatus status;
    private String notes;
}
