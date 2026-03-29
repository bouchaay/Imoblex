package fr.imoblex.modules.contact.mapper;

import fr.imoblex.modules.contact.dto.ContactResponse;
import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContactMapper {

    private final UserMapper userMapper;

    public ContactResponse toResponse(Contact c) {
        if (c == null) return null;
        return ContactResponse.builder()
                .id(c.getId())
                .salutation(c.getSalutation())
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .fullName(c.getFullName())
                .company(c.getCompany())
                .email(c.getEmail())
                .phone(c.getPhone())
                .mobile(c.getMobile())
                .address(c.getAddress())
                .city(c.getCity())
                .postalCode(c.getPostalCode())
                .type(c.getType())
                .status(c.getStatus())
                .assignedAgent(userMapper.toResponse(c.getAssignedAgent()))
                .notes(c.getNotes())
                .source(c.getSource())
                .acceptsEmail(c.getAcceptsEmail())
                .acceptsSms(c.getAcceptsSms())
                .interactionCount(c.getInteractions() != null ? c.getInteractions().size() : 0)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
