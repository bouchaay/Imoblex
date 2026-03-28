-- =============================================
-- IMOBLEX - Schéma initial de base de données
-- V1 - Initialisation
-- =============================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: users (agents / collaborateurs)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    mobile VARCHAR(20),
    avatar_url TEXT,
    title VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'AGENT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =============================================
-- TABLE: properties (biens immobiliers)
-- =============================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(20) NOT NULL UNIQUE,
    transaction_type VARCHAR(30) NOT NULL,
    property_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',

    -- Localisation
    address VARCHAR(300) NOT NULL,
    address_complement VARCHAR(200),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    department VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    address_visible BOOLEAN DEFAULT TRUE,

    -- Prix
    price DECIMAL(12, 2) NOT NULL,
    price_per_sqm DECIMAL(10, 2),
    rent_charges DECIMAL(10, 2),
    rent_deposit DECIMAL(10, 2),
    price_negotiable BOOLEAN DEFAULT FALSE,
    charges_included BOOLEAN DEFAULT FALSE,
    agency_fees DECIMAL(10, 2),
    agency_fees_info VARCHAR(200),

    -- Surfaces & pièces
    living_area DECIMAL(8, 2),
    total_area DECIMAL(8, 2),
    land_area DECIMAL(10, 2),
    rooms INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    toilets INTEGER,
    floor INTEGER,
    total_floors INTEGER,
    parking_spaces INTEGER,

    -- Description
    description TEXT,
    short_description VARCHAR(500),

    -- Caractéristiques
    elevator BOOLEAN DEFAULT FALSE,
    balcony BOOLEAN DEFAULT FALSE,
    terrace BOOLEAN DEFAULT FALSE,
    garden BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    garage BOOLEAN DEFAULT FALSE,
    cellar BOOLEAN DEFAULT FALSE,
    pool BOOLEAN DEFAULT FALSE,
    fireplace BOOLEAN DEFAULT FALSE,
    air_conditioning BOOLEAN DEFAULT FALSE,
    furnished BOOLEAN DEFAULT FALSE,
    accessible BOOLEAN DEFAULT FALSE,

    -- Chauffage
    heating_type VARCHAR(30),
    heating_energy VARCHAR(30),

    -- DPE
    dpe_class CHAR(1),
    ges_class CHAR(1),
    dpe_value DECIMAL(8, 2),
    ges_value DECIMAL(8, 2),
    dpe_done_date DATE,
    dpe_exempt BOOLEAN DEFAULT FALSE,

    -- Médias
    virtual_tour_url TEXT,
    video_url TEXT,
    floor_plan_url TEXT,

    -- Publication
    published_website BOOLEAN DEFAULT FALSE,
    published_seloger BOOLEAN DEFAULT FALSE,
    published_leboncoin BOOLEAN DEFAULT FALSE,
    published_pap BOOLEAN DEFAULT FALSE,
    published_bienici BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,

    -- Relations
    agent_id UUID REFERENCES users(id),

    -- Dates
    available_from DATE,
    construction_year DATE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Stats
    view_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    visit_count INTEGER DEFAULT 0
);

CREATE INDEX idx_properties_reference ON properties(reference);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_postal_code ON properties(postal_code);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_published ON properties(published_website, status);

-- =============================================
-- TABLE: property_photos
-- =============================================
CREATE TABLE property_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption VARCHAR(300),
    position INTEGER NOT NULL DEFAULT 0,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_photos_property ON property_photos(property_id);

-- =============================================
-- TABLE: contacts (CRM)
-- =============================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salutation VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    address VARCHAR(300),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    type VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'PROSPECT',
    agent_id UUID REFERENCES users(id),
    notes TEXT,
    accepts_email BOOLEAN DEFAULT TRUE,
    accepts_sms BOOLEAN DEFAULT FALSE,
    source VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_agent ON contacts(agent_id);

-- =============================================
-- TABLE: search_criteria (critères acheteurs)
-- =============================================
CREATE TABLE search_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30),
    property_type VARCHAR(30),
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    area_min DECIMAL(8, 2),
    area_max DECIMAL(8, 2),
    rooms_min INTEGER,
    rooms_max INTEGER,
    bedrooms_min INTEGER,
    cities TEXT,
    postal_codes TEXT,
    radius_km DECIMAL(6, 2),
    center_latitude DECIMAL(10, 7),
    center_longitude DECIMAL(10, 7),
    wants_garden BOOLEAN,
    wants_parking BOOLEAN,
    wants_elevator BOOLEAN,
    wants_balcony BOOLEAN,
    wants_terrace BOOLEAN,
    wants_pool BOOLEAN,
    wants_furnished BOOLEAN,
    alert_active BOOLEAN DEFAULT FALSE,
    alert_frequency VARCHAR(20) DEFAULT 'DAILY',
    additional_notes TEXT
);

-- =============================================
-- TABLE: contact_interactions (historique CRM)
-- =============================================
CREATE TABLE contact_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id),
    type VARCHAR(30) NOT NULL,
    content TEXT NOT NULL,
    related_property_ref VARCHAR(20),
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_contact ON contact_interactions(contact_id);
CREATE INDEX idx_interactions_agent ON contact_interactions(agent_id);

-- =============================================
-- TABLE: mandates (mandats)
-- =============================================
CREATE TABLE mandates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandate_number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    property_id UUID NOT NULL REFERENCES properties(id),
    mandator_id UUID NOT NULL REFERENCES contacts(id),
    agent_id UUID NOT NULL REFERENCES users(id),
    agreed_price DECIMAL(12, 2) NOT NULL,
    agency_fees DECIMAL(10, 2),
    agency_fees_percent DECIMAL(5, 2),
    fees_charged_to VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE,
    signed_at DATE,
    signed_at_place VARCHAR(200),
    signature_url TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mandates_status ON mandates(status);
CREATE INDEX idx_mandates_agent ON mandates(agent_id);
CREATE INDEX idx_mandates_end_date ON mandates(end_date);

-- =============================================
-- TABLE: transactions
-- =============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id),
    mandate_id UUID REFERENCES mandates(id),
    buyer_id UUID REFERENCES contacts(id),
    seller_id UUID REFERENCES contacts(id),
    agent_id UUID REFERENCES users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'OFFER',
    offer_price DECIMAL(12, 2),
    agreed_price DECIMAL(12, 2),
    agency_fees DECIMAL(10, 2),
    net_seller_price DECIMAL(12, 2),
    offer_date DATE,
    acceptance_date DATE,
    compromis_date DATE,
    acte_date DATE,
    completion_date DATE,
    notary_buyer VARCHAR(200),
    notary_seller VARCHAR(200),
    notary_office VARCHAR(200),
    loan_condition BOOLEAN DEFAULT FALSE,
    loan_amount DECIMAL(12, 2),
    loan_duration_months INTEGER,
    loan_rate DECIMAL(5, 3),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_property ON transactions(property_id);
CREATE INDEX idx_transactions_agent ON transactions(agent_id);

-- =============================================
-- TABLE: transaction_steps
-- =============================================
CREATE TABLE transaction_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    completed_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: appointments (agenda)
-- =============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    agent_id UUID NOT NULL REFERENCES users(id),
    contact_id UUID REFERENCES contacts(id),
    property_id UUID REFERENCES properties(id),
    location VARCHAR(300),
    confirmed BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'PLANNED',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_agent ON appointments(agent_id);
CREATE INDEX idx_appointments_start ON appointments(start_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- =============================================
-- TABLE: documents
-- =============================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(300) NOT NULL,
    type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    property_id UUID REFERENCES properties(id),
    mandate_id UUID REFERENCES mandates(id),
    transaction_id UUID REFERENCES transactions(id),
    contact_id UUID REFERENCES contacts(id),
    uploaded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_documents_mandate ON documents(mandate_id);
CREATE INDEX idx_documents_transaction ON documents(transaction_id);

-- =============================================
-- TABLE: notifications
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- =============================================
-- Données initiales
-- =============================================

-- Admin par défaut (mdp: Admin2024!)
INSERT INTO users (id, first_name, last_name, email, password, role, title)
VALUES (
    uuid_generate_v4(),
    'Admin',
    'Imoblex',
    'admin@imoblex.fr',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin2024!
    'ADMIN',
    'Directeur d''agence'
);
