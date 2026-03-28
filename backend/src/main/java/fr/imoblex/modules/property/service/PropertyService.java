package fr.imoblex.modules.property.service;

import fr.imoblex.modules.property.dto.PropertyCreateRequest;
import fr.imoblex.modules.property.dto.PropertyResponse;
import fr.imoblex.modules.property.dto.PropertySearchRequest;
import fr.imoblex.modules.property.entity.Property;
import fr.imoblex.modules.property.mapper.PropertyMapper;
import fr.imoblex.modules.property.repository.PropertyRepository;
import fr.imoblex.modules.property.repository.PropertySpecification;
import fr.imoblex.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyMapper propertyMapper;
    private final PropertyReferenceService referenceService;

    @Transactional(readOnly = true)
    public Page<PropertyResponse> search(PropertySearchRequest req) {
        Specification<Property> spec = PropertySpecification.buildSpec(req);
        Sort sort = Sort.by(Sort.Direction.fromString(req.getSortDir()), req.getSortBy());
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);
        return propertyRepository.findAll(spec, pageable).map(propertyMapper::toResponse);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "property", key = "#id")
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

    @CacheEvict(value = "property", key = "#result.id")
    public PropertyResponse create(PropertyCreateRequest request) {
        Property property = propertyMapper.toEntity(request);
        property.setReference(referenceService.generateNext());
        return propertyMapper.toResponse(propertyRepository.save(property));
    }

    @CacheEvict(value = "property", key = "#id")
    public PropertyResponse update(UUID id, PropertyCreateRequest request) {
        Property property = propertyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Bien introuvable: " + id));
        propertyMapper.updateFromRequest(request, property);
        return propertyMapper.toResponse(propertyRepository.save(property));
    }

    @CacheEvict(value = "property", key = "#id")
    public void delete(UUID id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bien introuvable: " + id);
        }
        propertyRepository.deleteById(id);
        log.info("Bien supprimé: {}", id);
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
