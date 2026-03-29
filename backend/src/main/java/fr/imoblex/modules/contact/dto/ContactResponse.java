package fr.imoblex.modules.contact.dto;

import fr.imoblex.modules.contact.enums.ContactStatus;
import fr.imoblex.modules.contact.enums.ContactType;
import fr.imoblex.modules.user.dto.UserResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ContactResponse {
    private UUID id;
    private String salutation;
    private String firstName;
    private String lastName;
    private String fullName;
    private String company;
    private String email;
    private String phone;
    private String mobile;
    private String address;
    private String city;
    private String postalCode;
    private ContactType type;
    private ContactStatus status;
    private UserResponse assignedAgent;
    private String notes;
    private String source;
    private Boolean acceptsEmail;
    private Boolean acceptsSms;
    private int interactionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
