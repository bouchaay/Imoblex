package fr.imoblex.modules.agenda.service;

import fr.imoblex.modules.agenda.dto.AppointmentRequest;
import fr.imoblex.modules.agenda.dto.AppointmentResponse;
import fr.imoblex.modules.agenda.entity.Appointment;
import fr.imoblex.modules.agenda.entity.Appointment.AppointmentStatus;
import fr.imoblex.modules.agenda.repository.AppointmentRepository;
import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.contact.repository.ContactRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AgendaService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final PropertyRepository propertyRepository;

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startAt").ascending());
        return appointmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findByStartAtBetweenOrderByStartAtAsc(start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> findUpcoming(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return appointmentRepository.findAllUpcoming(LocalDateTime.now(), pageable)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse findById(UUID id) {
        return appointmentRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("RDV introuvable: " + id));
    }

    public AppointmentResponse create(AppointmentRequest req) {
        Appointment a = new Appointment();
        mapRequestToAppointment(req, a);
        if (a.getStatus() == null) a.setStatus(AppointmentStatus.PLANNED);
        return toResponse(appointmentRepository.save(a));
    }

    public AppointmentResponse update(UUID id, AppointmentRequest req) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RDV introuvable: " + id));
        mapRequestToAppointment(req, a);
        return toResponse(appointmentRepository.save(a));
    }

    public void delete(UUID id) {
        if (!appointmentRepository.existsById(id)) throw new ResourceNotFoundException("RDV introuvable: " + id);
        appointmentRepository.deleteById(id);
    }

    private void mapRequestToAppointment(AppointmentRequest req, Appointment a) {
        a.setTitle(req.getTitle());
        a.setDescription(req.getDescription());
        a.setType(req.getType());
        a.setStartAt(req.getStartAt());
        a.setEndAt(req.getEndAt());
        User agent = userRepository.findById(req.getAgentId())
                .orElseThrow(() -> new ResourceNotFoundException("Agent introuvable: " + req.getAgentId()));
        a.setAgent(agent);
        // null explicite = effacer le contact ; présent = charger le contact
        if (req.getContactId() != null) {
            Contact contact = contactRepository.findById(req.getContactId()).orElse(null);
            a.setContact(contact);
        } else {
            a.setContact(null);
        }
        if (req.getPropertyId() != null) {
            Property property = propertyRepository.findById(req.getPropertyId()).orElse(null);
            a.setProperty(property);
        }
        a.setLocation(req.getLocation());
        a.setNotes(req.getNotes());
        if (req.getConfirmed() != null) a.setConfirmed(req.getConfirmed());
        if (req.getReminderSent() != null) a.setReminderSent(req.getReminderSent());
        if (req.getStatus() != null) a.setStatus(req.getStatus());
    }

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .type(a.getType())
                .startAt(a.getStartAt())
                .endAt(a.getEndAt())
                .agentId(a.getAgent() != null ? a.getAgent().getId() : null)
                .agentName(a.getAgent() != null ? a.getAgent().getFullName() : null)
                .contactId(a.getContact() != null ? a.getContact().getId() : null)
                .contactName(a.getContact() != null ? a.getContact().getFullName() : null)
                .propertyId(a.getProperty() != null ? a.getProperty().getId() : null)
                .propertyReference(a.getProperty() != null ? a.getProperty().getReference() : null)
                .location(a.getLocation())
                .confirmed(a.getConfirmed())
                .reminderSent(a.getReminderSent())
                .status(a.getStatus())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
