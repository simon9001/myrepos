-- ============================================================
-- SPONSORSHIP SYSTEM MIGRATION
-- Creates sponsor application → approval → sponsorship contract flow.
-- Safe to run on fresh databases or databases without existing partner tables.
-- ============================================================

-- STEP 1: Create New Enum Types
-- ============================================================
CREATE TYPE sponsor_application_status AS ENUM ('pending','under_review','approved','rejected');
CREATE TYPE sponsorship_status AS ENUM ('pending_payment','active','expired','cancelled');

-- STEP 2: Create Sponsor Applications Table
-- ============================================================
CREATE TABLE sponsor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    registration_number TEXT,
    tax_pin TEXT,
    website TEXT,
    contact_email TEXT NOT NULL,
    phone TEXT,
    description TEXT NOT NULL,
    product_category TEXT, -- seeds, fertilizer, equipment, etc.
    supporting_documents UUID[], -- array of media_library IDs
    status sponsor_application_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create Sponsorships (Contracts) Table
-- ============================================================
CREATE TABLE sponsorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_id UUID REFERENCES sponsor_applications(id) ON DELETE CASCADE,
    package_type VARCHAR(50), -- banner, featured_listing, newsletter, premium_visibility
    tier VARCHAR(20) DEFAULT 'standard', -- standard, verified, featured, strategic
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    status sponsorship_status DEFAULT 'pending_payment',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Create Indexes for Performance
-- ============================================================
CREATE INDEX idx_sponsor_applications_user_id ON sponsor_applications(user_id);
CREATE INDEX idx_sponsor_applications_status ON sponsor_applications(status);
CREATE INDEX idx_sponsorships_sponsor_id ON sponsorships(sponsor_id);
CREATE INDEX idx_sponsorships_status ON sponsorships(status);
CREATE INDEX idx_sponsorships_dates ON sponsorships(start_date, end_date);

-- STEP 5: Create Triggers for updated_at
-- ============================================================
CREATE TRIGGER update_sponsor_applications_modtime
    BEFORE UPDATE ON sponsor_applications
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- STEP 6: Add 'sponsor' to user_role enum if not present
-- ============================================================
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sponsor';

-- STEP 7: Handle revenue_logs if it exists (OPTIONAL)
-- ============================================================
-- Only runs if revenue_logs table exists with partner_id column
DO $$
BEGIN
    -- Check if revenue_logs exists and has partner_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'revenue_logs'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'revenue_logs' AND column_name = 'partner_id'
    ) THEN
        RAISE NOTICE 'Updating revenue_logs to reference sponsor_applications...';
        
        -- Drop the old foreign key constraint
        ALTER TABLE revenue_logs DROP CONSTRAINT IF EXISTS revenue_logs_partner_id_fkey;
        
        -- Rename the column
        ALTER TABLE revenue_logs RENAME COLUMN partner_id TO sponsor_id;
        
        -- Add new foreign key constraint
        ALTER TABLE revenue_logs ADD CONSTRAINT revenue_logs_sponsor_id_fkey
            FOREIGN KEY (sponsor_id) REFERENCES sponsor_applications(id);
    ELSE
        RAISE NOTICE 'revenue_logs table or partner_id column not found, skipping...';
    END IF;
END
$$;

-- STEP 8: Clean up old partner tables if they exist (OPTIONAL)
-- ============================================================
-- Only drop tables if they exist
DROP TABLE IF EXISTS partner_products CASCADE;
DROP TABLE IF EXISTS partners CASCADE;

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS update_partners_modtime ON partners;
DROP TRIGGER IF EXISTS update_partner_products_modtime ON partner_products;

-- Drop the increment_product_views function if it exists
DROP FUNCTION IF EXISTS increment_product_views(UUID);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

SELECT 'Sponsorship system migration completed successfully!' AS status;
