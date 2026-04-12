package fr.imoblex.modules.lead.service;

import fr.imoblex.modules.lead.dto.LeadResponse;
import fr.imoblex.modules.lead.dto.LeadSubmitRequest;
import fr.imoblex.modules.lead.entity.Lead;
import fr.imoblex.modules.lead.entity.LeadStatus;
import fr.imoblex.modules.lead.repository.LeadRepository;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;

    @Transactional
    public LeadResponse submit(LeadSubmitRequest req) {
        Lead lead = Lead.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .message(req.getMessage())
                .propertyReference(req.getPropertyReference())
                .source("WEBSITE")
                .formType(req.getFormType() != null ? req.getFormType() : "CONTACT")
                .status(LeadStatus.UNREAD)
                .archived(false)
                .gdprConsent(req.isGdprConsent())
                .build();
        return toResponse(leadRepository.save(lead));
    }

    public List<LeadResponse> getActive() {
        return leadRepository.findByArchivedFalseOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public List<LeadResponse> getArchived() {
        return leadRepository.findByArchivedTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public LeadResponse markRead(UUID id) {
        Lead lead = getOrThrow(id);
        if (lead.getStatus() == LeadStatus.UNREAD) {
            lead.setStatus(LeadStatus.READ);
            lead.setReadAt(LocalDateTime.now());
            leadRepository.save(lead);
        }
        return toResponse(lead);
    }

    @Transactional
    public LeadResponse archive(UUID id) {
        Lead lead = getOrThrow(id);
        lead.setArchived(true);
        lead.setStatus(LeadStatus.ARCHIVED);
        lead.setArchivedAt(LocalDateTime.now());
        return toResponse(leadRepository.save(lead));
    }

    @Transactional
    public LeadResponse unarchive(UUID id) {
        Lead lead = getOrThrow(id);
        lead.setArchived(false);
        lead.setStatus(LeadStatus.READ);
        lead.setArchivedAt(null);
        return toResponse(leadRepository.save(lead));
    }

    @Transactional
    public void delete(UUID id) {
        leadRepository.delete(getOrThrow(id));
    }

    public long countUnread() {
        return leadRepository.countUnread();
    }

    private Lead getOrThrow(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead non trouvé : " + id));
    }

    private LeadResponse toResponse(Lead l) {
        return LeadResponse.builder()
                .id(l.getId())
                .firstName(l.getFirstName())
                .lastName(l.getLastName())
                .email(l.getEmail())
                .phone(l.getPhone())
                .message(l.getMessage())
                .propertyReference(l.getPropertyReference())
                .source(l.getSource())
                .formType(l.getFormType())
                .status(l.getStatus())
                .archived(Boolean.TRUE.equals(l.getArchived()))
                .gdprConsent(Boolean.TRUE.equals(l.getGdprConsent()))
                .readAt(l.getReadAt())
                .archivedAt(l.getArchivedAt())
                .createdAt(l.getCreatedAt())
                .updatedAt(l.getUpdatedAt())
                .build();
    }
}
