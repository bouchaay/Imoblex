package fr.imoblex.modules.newsletter.service;

import fr.imoblex.modules.newsletter.dto.NewsletterSubscribeRequest;
import fr.imoblex.modules.newsletter.entity.NewsletterSubscriber;
import fr.imoblex.modules.newsletter.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final NewsletterSubscriberRepository repository;

    @Transactional
    public Map<String, String> subscribe(NewsletterSubscribeRequest request) {
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("Email invalide");
        }
        if (!Boolean.TRUE.equals(request.getGdprConsent())) {
            throw new IllegalArgumentException("Le consentement RGPD est requis");
        }

        // Already subscribed → return success silently (don't reveal if email exists)
        if (repository.existsByEmailAndActiveTrue(request.getEmail().toLowerCase().trim())) {
            return Map.of("status", "already_subscribed");
        }

        NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
                .email(request.getEmail().toLowerCase().trim())
                .city(request.getCity())
                .transactionType(request.getTransactionType())
                .minBudget(request.getMinBudget())
                .maxBudget(request.getMaxBudget())
                .propertyTypes(request.getPropertyTypes())
                .gdprConsent(true)
                .gdprConsentDate(LocalDateTime.now())
                .active(true)
                .build();

        repository.save(subscriber);
        return Map.of("status", "subscribed");
    }

    @Transactional
    public void unsubscribe(String token) {
        repository.findByUnsubscribeToken(token).ifPresent(s -> {
            s.setActive(false);
            s.setUnsubscribedAt(LocalDateTime.now());
            repository.save(s);
        });
    }
}
