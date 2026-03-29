package fr.imoblex.modules.contact.dto;

import fr.imoblex.modules.contact.enums.ContactStatus;
import fr.imoblex.modules.contact.enums.ContactType;
import lombok.Data;

@Data
public class ContactSearchRequest {
    private String query;
    private ContactType type;
    private ContactStatus status;
    private String city;
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDir = "DESC";
}
