package fr.imoblex.modules.contact.dto;

import fr.imoblex.modules.contact.enums.ContactStatus;
import fr.imoblex.modules.contact.enums.ContactType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ContactRequest {
    private String salutation;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String company;
    private String email;
    private String phone;
    private String mobile;
    private String address;
    private String city;
    private String postalCode;
    @NotNull private ContactType type;
    private ContactStatus status;
    private UUID assignedAgentId;
    private String notes;
    private String source;
    private Boolean acceptsEmail;
    private Boolean acceptsSms;
    // Critères de recherche (acheteur/locataire)
    private String searchTransactionType;
    private String searchPropertyType;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private BigDecimal areaMin;
    private BigDecimal areaMax;
    private Integer roomsMin;
}
