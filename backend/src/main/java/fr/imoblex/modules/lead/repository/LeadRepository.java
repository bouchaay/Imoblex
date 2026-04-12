package fr.imoblex.modules.lead.repository;

import fr.imoblex.modules.lead.entity.Lead;
import fr.imoblex.modules.lead.entity.LeadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface LeadRepository extends JpaRepository<Lead, UUID> {

    List<Lead> findByArchivedFalseOrderByCreatedAtDesc();

    List<Lead> findByArchivedTrueOrderByCreatedAtDesc();

    long countByStatusAndArchivedFalse(LeadStatus status);

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.status = 'UNREAD' AND l.archived = false")
    long countUnread();
}
