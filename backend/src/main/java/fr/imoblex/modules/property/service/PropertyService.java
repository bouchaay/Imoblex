package fr.imoblex.modules.property.service;

import fr.imoblex.modules.contact.entity.Contact;
import fr.imoblex.modules.contact.repository.ContactRepository;
import fr.imoblex.modules.property.dto.PropertyCreateRequest;
import fr.imoblex.modules.property.dto.PropertyResponse;
import fr.imoblex.modules.property.dto.PropertySearchRequest;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.entity.PropertyShop;
import fr.imoblex.modules.property.entity.PropertyTransport;
import fr.imoblex.modules.property.mapper.PropertyMapper;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.modules.property.repository.PropertyShopRepository;
import fr.imoblex.modules.property.repository.PropertySpecification;
import fr.imoblex.modules.property.repository.PropertyTransportRepository;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;
    private final PropertyReferenceService referenceService;
    private final PhotoStorageService photoStorageService;
    private final ContactRepository contactRepository;
    private final PropertyTransportRepository transportRepository;
    private final PropertyShopRepository shopRepository;

    @Transactional(readOnly = true)
    public Page<PropertyResponse> search(PropertySearchRequest req) {
        Specification<Property> spec = PropertySpecification.buildSpec(req);
        Sort sort = Sort.by(Sort.Direction.fromString(req.getSortDir()), req.getSortBy());
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);
        return propertyRepository.findAll(spec, pageable).map(propertyMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PropertyResponse findById(UUID id) {
        return propertyRepository.findById(id)
            .map(propertyMapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + id));
    }

    @Transactional(readOnly = true)
    public PropertyResponse findByReference(String reference) {
        return propertyRepository.findByReference(reference)
            .map(propertyMapper::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + reference));
    }

    public PropertyResponse create(PropertyCreateRequest request) {
        Property property = propertyMapper.toEntity(request);
        property.setReference(referenceService.generateNext());
        if (request.getOwnerId() != null) {
            Contact owner = contactRepository.findById(request.getOwnerId()).orElse(null);
            property.setOwner(owner);
        }
        Property saved = propertyRepository.save(property);
        saveTransports(saved, request.getTransports());
        saveShops(saved, request.getShops());
        return propertyMapper.toResponse(propertyRepository.findById(saved.getId()).orElse(saved));
    }

    public PropertyResponse update(UUID id, PropertyCreateRequest request) {
        Property property = propertyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + id));
        propertyMapper.updateFromRequest(request, property);
        // Mise à jour du propriétaire
        if (request.getOwnerId() != null) {
            Contact owner = contactRepository.findById(request.getOwnerId()).orElse(null);
            property.setOwner(owner);
        } else {
            property.setOwner(null);
        }
        Property saved = propertyRepository.save(property);
        // Mettre à jour transports et commerces
        transportRepository.deleteByPropertyId(saved.getId());
        shopRepository.deleteByPropertyId(saved.getId());
        saveTransports(saved, request.getTransports());
        saveShops(saved, request.getShops());
        return propertyMapper.toResponse(propertyRepository.findById(saved.getId()).orElse(saved));
    }

    private void saveTransports(Property property, List<PropertyCreateRequest.TransportDto> dtos) {
        if (dtos == null || dtos.isEmpty()) return;
        for (int i = 0; i < dtos.size(); i++) {
            PropertyCreateRequest.TransportDto dto = dtos.get(i);
            if (dto.getType() == null) continue;
            PropertyTransport t = PropertyTransport.builder()
                .property(property)
                .type(dto.getType())
                .line(dto.getLine())
                .name(dto.getName())
                .distanceMeters(dto.getDistanceMeters())
                .walkingMinutes(dto.getWalkingMinutes())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : i)
                .build();
            transportRepository.save(t);
        }
    }

    private void saveShops(Property property, List<PropertyCreateRequest.ShopDto> dtos) {
        if (dtos == null || dtos.isEmpty()) return;
        for (int i = 0; i < dtos.size(); i++) {
            PropertyCreateRequest.ShopDto dto = dtos.get(i);
            if (dto.getType() == null) continue;
            PropertyShop s = PropertyShop.builder()
                .property(property)
                .type(dto.getType())
                .name(dto.getName())
                .distanceMeters(dto.getDistanceMeters())
                .walkingMinutes(dto.getWalkingMinutes())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : i)
                .build();
            shopRepository.save(s);
        }
    }

    public void delete(UUID id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bien introuvable: " + id);
        }
        propertyRepository.deleteById(id);
        photoStorageService.deletePropertyFolder(id);
        log.info("Bien supprimé (avec photos): {}", id);
    }

    public void incrementViewCount(UUID id) {
        propertyRepository.incrementViewCount(id);
    }

    public PropertyResponse togglePublish(UUID id) {
        Property property = propertyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + id));
        property.setPublishedWebsite(!Boolean.TRUE.equals(property.getPublishedWebsite()));
        return propertyMapper.toResponse(propertyRepository.save(property));
    }
}
