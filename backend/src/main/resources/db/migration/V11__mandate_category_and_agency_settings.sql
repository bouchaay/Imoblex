-- Ajout catégorie et durée max sur les mandats
ALTER TABLE mandates ADD COLUMN IF NOT EXISTS mandate_category VARCHAR(20) NOT NULL DEFAULT 'GERANCE';
ALTER TABLE mandates ADD COLUMN IF NOT EXISTS max_duration_years INTEGER DEFAULT 3;

-- Table paramètres agence
CREATE TABLE IF NOT EXISTS agency_settings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(255) DEFAULT 'IMOBLEX',
    representative_name     VARCHAR(255),
    address                 VARCHAR(255),
    city                    VARCHAR(100),
    postal_code             VARCHAR(10),
    email                   VARCHAR(100),
    phone                   VARCHAR(30),
    website                 VARCHAR(255),
    siret                   VARCHAR(50),
    professional_card_number VARCHAR(100),
    prefecture              VARCHAR(100),
    guarantee_amount        VARCHAR(100),
    guarantee_insurer       VARCHAR(255),
    signature_image_path    VARCHAR(500),
    logo_path               VARCHAR(500),
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP
);

-- Ligne par défaut
INSERT INTO agency_settings (id, name, city, email, phone, signature_image_path)
SELECT gen_random_uuid(), 'IMOBLEX', 'Toulouse', 'contact@imoblex.fr', '05.61.61.57.38',
       'C:/Users/offic/OneDrive/Bureau/Imoblex/images/signature.jpg'
WHERE NOT EXISTS (SELECT 1 FROM agency_settings);
