package fr.imoblex.modules.newsletter.dto;

import lombok.Data;

@Data
public class NewsletterSubscribeRequest {
    private String email;
    private String city;
    private String transactionType;
    private Integer minBudget;
    private Integer maxBudget;
    private String propertyTypes;
    private Boolean gdprConsent;
}
