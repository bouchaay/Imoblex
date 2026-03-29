-- Fix CHAR(1) → VARCHAR(1) for dpe_class and ges_class
-- Hibernate maps String → VARCHAR; CHAR(1) = bpchar causes schema-validation failure
ALTER TABLE properties
    ALTER COLUMN dpe_class TYPE VARCHAR(1),
    ALTER COLUMN ges_class TYPE VARCHAR(1);
