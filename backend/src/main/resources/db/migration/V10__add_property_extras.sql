-- Available from date
ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_from DATE;

-- Nearby transports
CREATE TABLE IF NOT EXISTS property_transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    line VARCHAR(100),
    name VARCHAR(200),
    distance_meters INTEGER,
    walking_minutes INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Nearby shops/amenities
CREATE TABLE IF NOT EXISTS property_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(200),
    distance_meters INTEGER,
    walking_minutes INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_transports_property_id ON property_transports(property_id);
CREATE INDEX IF NOT EXISTS idx_property_shops_property_id ON property_shops(property_id);
