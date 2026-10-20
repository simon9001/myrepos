-- STEP 1: Create New Enum Types
-- ============================================================
CREATE TYPE market_product_status AS ENUM ('upcoming', 'harvested', 'in_transit', 'delivered');
CREATE TYPE market_auction_status AS ENUM ('active', 'ended', 'won', 'awaiting_payment', 'confirmed');

-- STEP 2: Create Market Products Table
-- ============================================================
CREATE TABLE market_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    description TEXT,
    quantity_available TEXT NOT NULL,
    price NUMERIC(15,2), -- Fixed price
    auction_enabled BOOLEAN DEFAULT FALSE,
    starting_bid_price NUMERIC(15,2),
    auction_end_date TIMESTAMP WITH TIME ZONE,
    harvest_date DATE,
    status market_product_status DEFAULT 'upcoming',
    is_organic BOOLEAN DEFAULT FALSE,
    attributes JSONB DEFAULT '{}', -- For flexible data like (organic certification, grade, etc.)
    images UUID[], -- Array of media_library IDs
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create Market Bids Table
-- ============================================================
CREATE TABLE market_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES market_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Create Market Orders Table
-- ============================================================
-- Handles both direct purchases and won auctions
CREATE TABLE market_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES market_products(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bid_id UUID REFERENCES market_bids(id),
    order_type VARCHAR(20) NOT NULL, -- 'direct' or 'auction'
    amount NUMERIC(15,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending_payment',
    delivery_status market_product_status DEFAULT 'upcoming',
    auction_status market_auction_status,
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Update Existing Market Requests Table (Optional logic enhancement)
-- ============================================================
-- Ensure market_requests has budget, quality, location etc (already there mostly)

-- STEP 6: Triggers for updated_at
-- ============================================================
CREATE TRIGGER update_market_products_modtime
    BEFORE UPDATE ON market_products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_market_orders_modtime
    BEFORE UPDATE ON market_orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- STEP 7: Create Indexes
-- ============================================================
CREATE INDEX idx_market_products_status ON market_products(status);
CREATE INDEX idx_market_products_published ON market_products(is_published);
CREATE INDEX idx_market_bids_product_id ON market_bids(product_id);
CREATE INDEX idx_market_orders_user_id ON market_orders(user_id);
CREATE INDEX idx_market_orders_product_id ON market_orders(product_id);

-- ============================================================
-- MIGRATION PREPARED
-- ============================================================
