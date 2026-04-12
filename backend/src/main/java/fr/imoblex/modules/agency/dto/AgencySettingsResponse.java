package fr.imoblex.modules.agency.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class AgencySettingsResponse {
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
}
