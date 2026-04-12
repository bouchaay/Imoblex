package fr.imoblex.modules.agency.repository;

import fr.imoblex.modules.agency.entity.AgencySettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AgencySettingsRepository extends JpaRepository<AgencySettings, UUID> {
}
