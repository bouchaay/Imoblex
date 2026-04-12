package fr.imoblex.modules.agency.service;

import fr.imoblex.modules.agency.dto.AgencySettingsRequest;
import fr.imoblex.modules.agency.dto.AgencySettingsResponse;
import fr.imoblex.modules.agency.entity.AgencySettings;
import fr.imoblex.modules.agency.repository.AgencySettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AgencySettingsService {

    private final AgencySettingsRepository repository;

    public AgencySettingsResponse get() {
        List<AgencySettings> all = repository.findAll();
        if (all.isEmpty()) {
            AgencySettings defaults = new AgencySettings();
            defaults.setName("IMOBLEX");
            return toResponse(repository.save(defaults));
        }
        return toResponse(all.get(0));
    }

    public AgencySettings getEntity() {
        List<AgencySettings> all = repository.findAll();
        if (all.isEmpty()) {
            AgencySettings defaults = new AgencySettings();
            defaults.setName("IMOBLEX");
            return repository.save(defaults);
        }
        return all.get(0);
    }

    public AgencySettingsResponse update(AgencySettingsRequest req) {
        AgencySettings entity = getEntity();
        if (req.getName() != null) entity.setName(req.getName());
        if (req.getRepresentativeName() != null) entity.setRepresentativeName(req.getRepresentativeName());
        if (req.getAddress() != null) entity.setAddress(req.getAddress());
        if (req.getCity() != null) entity.setCity(req.getCity());
        if (req.getPostalCode() != null) entity.setPostalCode(req.getPostalCode());
        if (req.getEmail() != null) entity.setEmail(req.getEmail());
        if (req.getPhone() != null) entity.setPhone(req.getPhone());
        if (req.getWebsite() != null) entity.setWebsite(req.getWebsite());
        if (req.getSiret() != null) entity.setSiret(req.getSiret());
        if (req.getProfessionalCardNumber() != null) entity.setProfessionalCardNumber(req.getProfessionalCardNumber());
        if (req.getPrefecture() != null) entity.setPrefecture(req.getPrefecture());
        if (req.getGuaranteeAmount() != null) entity.setGuaranteeAmount(req.getGuaranteeAmount());
        if (req.getGuaranteeInsurer() != null) entity.setGuaranteeInsurer(req.getGuaranteeInsurer());
        if (req.getSignatureImagePath() != null) entity.setSignatureImagePath(req.getSignatureImagePath());
        if (req.getLogoPath() != null) entity.setLogoPath(req.getLogoPath());
        return toResponse(repository.save(entity));
    }

    private AgencySettingsResponse toResponse(AgencySettings e) {
        return AgencySettingsResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .representativeName(e.getRepresentativeName())
                .address(e.getAddress())
                .city(e.getCity())
                .postalCode(e.getPostalCode())
                .email(e.getEmail())
                .phone(e.getPhone())
                .website(e.getWebsite())
                .siret(e.getSiret())
                .professionalCardNumber(e.getProfessionalCardNumber())
                .prefecture(e.getPrefecture())
                .guaranteeAmount(e.getGuaranteeAmount())
                .guaranteeInsurer(e.getGuaranteeInsurer())
                .signatureImagePath(e.getSignatureImagePath())
                .logoPath(e.getLogoPath())
                .build();
    }
}
