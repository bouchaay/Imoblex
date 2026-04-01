-- V4: Ajout de la colonne owner_id dans la table properties
-- Permet d'associer un contact (propriétaire) directement à un bien

ALTER TABLE properties
    ADD COLUMN owner_id UUID REFERENCES contacts(id) ON DELETE SET NULL;

CREATE INDEX idx_properties_owner ON properties(owner_id);
