package fr.imoblex.modules.contact.service;

import fr.imoblex.modules.contact.dto.ContactRequest;
import fr.imoblex.modules.contact.dto.ContactResponse;
import fr.imoblex.modules.contact.dto.ContactSearchRequest;
import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.contact.enums.ContactStatus;
import fr.imoblex.modules.contact.mapper.ContactMapper;
import fr.imoblex.modules.contact.repository.ContactRepository;
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

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ContactResponse> search(ContactSearchRequest req) {
        Sort sort = Sort.by(Sort.Direction.fromString(req.getSortDir()), req.getSortBy());
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);
        Page<Contact> page;
        if (req.getQuery() != null && !req.getQuery().isBlank()) {
            page = contactRepository.search(req.getQuery(), pageable);
        } else if (req.getType() != null) {
            page = contactRepository.findByType(req.getType(), pageable);
        } else if (req.getStatus() != null) {
            page = contactRepository.findByStatus(req.getStatus(), pageable);
        } else {
            page = contactRepository.findAll(pageable);
        }
        return page.map(contactMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ContactResponse findById(UUID id) {
        return contactRepository.findById(id)
                .map(contactMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Contact introuvable: " + id));
    }

    public ContactResponse create(ContactRequest req) {
        Contact contact = new Contact();
        mapRequestToContact(req, contact);
        if (contact.getStatus() == null) contact.setStatus(ContactStatus.PROSPECT);
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    public ContactResponse update(UUID id, ContactRequest req) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact introuvable: " + id));
        mapRequestToContact(req, contact);
        return contactMapper.toResponse(contactRepository.save(contact));
    }

    public void delete(UUID id) {
        if (!contactRepository.existsById(id)) throw new ResourceNotFoundException("Contact introuvable: " + id);
        contactRepository.deleteById(id);
    }

    private void mapRequestToContact(ContactRequest req, Contact c) {
        c.setSalutation(req.getSalutation());
        c.setFirstName(req.getFirstName());
        c.setLastName(req.getLastName());
        c.setCompany(req.getCompany());
        c.setEmail(req.getEmail());
        c.setPhone(req.getPhone());
        c.setMobile(req.getMobile());
        c.setAddress(req.getAddress());
        c.setCity(req.getCity());
        c.setPostalCode(req.getPostalCode());
        c.setType(req.getType());
        if (req.getStatus() != null) c.setStatus(req.getStatus());
        c.setNotes(req.getNotes());
        c.setSource(req.getSource());
        if (req.getAcceptsEmail() != null) c.setAcceptsEmail(req.getAcceptsEmail());
        if (req.getAcceptsSms() != null) c.setAcceptsSms(req.getAcceptsSms());
        if (req.getAssignedAgentId() != null) {
            User agent = userRepository.findById(req.getAssignedAgentId()).orElse(null);
            c.setAssignedAgent(agent);
        }
    }
}
