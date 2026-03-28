package fr.imoblex.modules.property.service;

import fr.imoblex.modules.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PropertyReferenceService {

    private final PropertyRepository propertyRepository;

    public synchronized String generateNext() {
        long next = propertyRepository.findMaxReferenceNumber().orElse(0L) + 1;
        return String.format("IMB%05d", next);
    }
}
