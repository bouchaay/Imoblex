package fr.imoblex.modules.newsletter.repository;

import fr.imoblex.modules.newsletter.entity.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, UUID> {
    boolean existsByEmailAndActiveTrue(String email);
    Optional<NewsletterSubscriber> findByUnsubscribeToken(String token);
}
