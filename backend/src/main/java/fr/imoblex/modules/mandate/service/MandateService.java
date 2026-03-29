package fr.imoblex.modules.mandate.service;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.contact.repository.ContactRepository;
import fr.imoblex.modules.mandate.dto.MandateRequest;
import fr.imoblex.modules.mandate.dto.MandateResponse;
import fr.imoblex.modules.mandate.entity.Mandate;
import fr.imoblex.modules.mandate.enums.MandateStatus;
import fr.imoblex.modules.mandate.repository.MandateRepository;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.modules.user.entity.User;
import fr.imoblex.modules.user.repository.UserRepository;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MandateService {

    private final MandateRepository mandateRepository;
    private final PropertyRepository propertyRepository;
    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<MandateResponse> findAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return mandateRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<MandateResponse> findByStatus(MandateStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return mandateRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public MandateResponse findById(UUID id) {
        return mandateRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Mandat introuvable: " + id));
    }

    @Transactional(readOnly = true)
    public List<MandateResponse> findExpiringMandates(int days) {
        LocalDate now = LocalDate.now();
        LocalDate cutoff = now.plusDays(days);
        return mandateRepository.findExpiringMandates(now, cutoff).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MandateResponse create(MandateRequest req) {
        Mandate mandate = new Mandate();
        mandate.setMandateNumber(generateMandateNumber());
        mapRequestToMandate(req, mandate);
        if (mandate.getStatus() == null) mandate.setStatus(MandateStatus.ACTIVE);
        return toResponse(mandateRepository.save(mandate));
    }

    public MandateResponse update(UUID id, MandateRequest req) {
        Mandate mandate = mandateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mandat introuvable: " + id));
        mapRequestToMandate(req, mandate);
        return toResponse(mandateRepository.save(mandate));
    }

    public void delete(UUID id) {
        if (!mandateRepository.existsById(id)) throw new ResourceNotFoundException("Mandat introuvable: " + id);
        mandateRepository.deleteById(id);
    }

    private void mapRequestToMandate(MandateRequest req, Mandate m) {
        m.setType(req.getType());
        if (req.getStatus() != null) m.setStatus(req.getStatus());
        Property property = propertyRepository.findById(req.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + req.getPropertyId()));
        m.setProperty(property);
        Contact mandator = contactRepository.findById(req.getMandatorId())
                .orElseThrow(() -> new ResourceNotFoundException("Contact introuvable: " + req.getMandatorId()));
        m.setMandator(mandator);
        User agent = userRepository.findById(req.getAgentId())
                .orElseThrow(() -> new ResourceNotFoundException("Agent introuvable: " + req.getAgentId()));
        m.setAgent(agent);
        m.setAgreedPrice(req.getAgreedPrice());
        m.setAgencyFees(req.getAgencyFees());
        m.setAgencyFeesPercent(req.getAgencyFeesPercent());
        m.setFeesChargedTo(req.getFeesChargedTo());
        m.setStartDate(req.getStartDate());
        m.setEndDate(req.getEndDate());
        m.setRenewalDate(req.getRenewalDate());
        m.setSignedAt(req.getSignedAt());
        m.setSignedAtPlace(req.getSignedAtPlace());
        m.setNotes(req.getNotes());
    }

    private String generateMandateNumber() {
        Optional<Long> max = mandateRepository.findMaxMandateNumber();
        long next = max.orElse(10000L) + 1;
        return "MND" + next;
    }

    private MandateResponse toResponse(Mandate m) {
        return MandateResponse.builder()
                .id(m.getId())
                .mandateNumber(m.getMandateNumber())
                .type(m.getType())
                .status(m.getStatus())
                .propertyId(m.getProperty() != null ? m.getProperty().getId() : null)
                .propertyReference(m.getProperty() != null ? m.getProperty().getReference() : null)
                .propertyAddress(m.getProperty() != null ? m.getProperty().getAddress() + ", " + m.getProperty().getCity() : null)
                .mandatorId(m.getMandator() != null ? m.getMandator().getId() : null)
                .mandatorName(m.getMandator() != null ? m.getMandator().getFullName() : null)
                .agentId(m.getAgent() != null ? m.getAgent().getId() : null)
                .agentName(m.getAgent() != null ? m.getAgent().getFullName() : null)
                .agreedPrice(m.getAgreedPrice())
                .agencyFees(m.getAgencyFees())
                .agencyFeesPercent(m.getAgencyFeesPercent())
                .feesChargedTo(m.getFeesChargedTo())
                .startDate(m.getStartDate())
                .endDate(m.getEndDate())
                .renewalDate(m.getRenewalDate())
                .signedAt(m.getSignedAt())
                .signedAtPlace(m.getSignedAtPlace())
                .notes(m.getNotes())
                .expired(m.isExpired())
                .expiringSoon(m.isExpiringSoon())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
