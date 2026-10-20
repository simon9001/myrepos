-- Migrations for Farmer Membership, Partner Management, and Market Access Request Systems

-- 1. Extend Users Role (Optional: already handled in Zod, but good for DB constraints)
-- Note: Supabase types might be restrictive, using VARCHAR for flexibility
-- ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20);

-- 2. Memberships Table
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free', 'premium'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    transaction_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    categories TEXT[], -- Array of categories
    website TEXT,
    is_active BOOLEAN DEFAULT FALSE, -- Admin must approve
    revenue_share NUMERIC(5,2) DEFAULT 0, -- If applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Partner Products Table
CREATE TABLE IF NOT EXISTS partner_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(15,2) NOT NULL,
    premium_discount NUMERIC(15,2) DEFAULT 0,
    category VARCHAR(50),
    image_url TEXT,
    views_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Market Requests Table (Buyer Requests)
CREATE TABLE IF NOT EXISTS market_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    location TEXT NOT NULL,
    timeline TEXT NOT NULL,
    quality_requirements TEXT,
    budget_range TEXT,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'matched', 'confirmed', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Supply Offers Table (Farmers responding to requests)
CREATE TABLE IF NOT EXISTS supply_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES market_requests(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quantity TEXT NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Revenue Logs
CREATE TABLE IF NOT EXISTS revenue_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    type VARCHAR(50), -- 'subscription', 'commission', 'ads'
    amount NUMERIC(15,2) NOT NULL,
    transaction_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Commission Logs
CREATE TABLE IF NOT EXISTS commission_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES market_requests(id),
    farmer_id UUID REFERENCES users(id),
    amount NUMERIC(15,2) NOT NULL,
    percentage NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memberships_modtime BEFORE UPDATE ON memberships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_partners_modtime BEFORE UPDATE ON partners FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_partner_products_modtime BEFORE UPDATE ON partner_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_market_requests_modtime BEFORE UPDATE ON market_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RPC for incrementing product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE partner_products
    SET views_count = views_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
