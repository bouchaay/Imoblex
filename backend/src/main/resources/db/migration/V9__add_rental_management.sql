CREATE TABLE rental_leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id),
    tenant_id UUID NOT NULL REFERENCES contacts(id),
    landlord_id UUID REFERENCES contacts(id),
    agent_id UUID REFERENCES users(id),
    lease_type VARCHAR(30) NOT NULL DEFAULT 'UNFURNISHED',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    start_date DATE NOT NULL,
    end_date DATE,
    rent_amount DECIMAL(12,2) NOT NULL,
    charges_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(12,2) DEFAULT 0,
    payment_day_of_month INTEGER DEFAULT 1,
    payment_method VARCHAR(30) DEFAULT 'TRANSFER',
    renewal_date DATE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE rental_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lease_id UUID NOT NULL REFERENCES rental_leases(id) ON DELETE CASCADE,
    payment_month INTEGER NOT NULL,
    payment_year INTEGER NOT NULL,
    expected_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_date DATE,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(30),
    reference VARCHAR(255),
    notes TEXT,
    quittance_generated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(lease_id, payment_month, payment_year)
);

CREATE INDEX idx_rental_leases_property ON rental_leases(property_id);
CREATE INDEX idx_rental_leases_tenant ON rental_leases(tenant_id);
CREATE INDEX idx_rental_leases_status ON rental_leases(status);
CREATE INDEX idx_rental_payments_lease ON rental_payments(lease_id);
CREATE INDEX idx_rental_payments_status ON rental_payments(status);
