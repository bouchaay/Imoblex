package fr.imoblex.modules.lead.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LeadSubmitRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank @Email private String email;
    private String phone;
    private String message;
    private String propertyReference;
    private String formType; // CONTACT, ESTIMATION, PROPERTY_INQUIRY
    private boolean gdprConsent;
}
