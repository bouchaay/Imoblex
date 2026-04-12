-- =============================================
-- IMOBLEX V5 - Table leads (formulaires site web)
-- =============================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    phone      VARCHAR(30),
    message    TEXT,
    property_reference VARCHAR(50),
    source     VARCHAR(100) NOT NULL DEFAULT 'WEBSITE',
    form_type  VARCHAR(50)  NOT NULL DEFAULT 'CONTACT',
    status     VARCHAR(20)  NOT NULL DEFAULT 'UNREAD',
    archived   BOOLEAN      NOT NULL DEFAULT FALSE,
    gdpr_consent BOOLEAN    NOT NULL DEFAULT FALSE,
    read_at    TIMESTAMP,
    archived_at TIMESTAMP,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status  ON leads(status);
CREATE INDEX idx_leads_archived ON leads(archived);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
