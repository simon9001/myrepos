-- Migration to support tiered farmer membership and listing ownership

-- 1. Update market_products to include ownership and metrics
ALTER TABLE market_products ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE market_products ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0;

-- 2. Update memberships to include commission rates and limits
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00; -- 10% default
ALTER TABLE memberships ADD COLUMN IF NOT EXISTS listing_limit INT DEFAULT 3; -- 3 for free tier

-- 3. Set Premium defaults
-- Note: This is a manual update for existing premium rows if any
UPDATE memberships SET commission_rate = 5.00, listing_limit = 1000 WHERE tier = 'premium';

-- 4. Update market_orders to include commission tracking
ALTER TABLE market_orders ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2);
ALTER TABLE market_orders ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(15,2);
ALTER TABLE market_orders ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES users(id); -- Who gets paid

-- 5. RPC for incrementing market product views
CREATE OR REPLACE FUNCTION increment_market_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE market_products
    SET views_count = views_count + 1
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;


simooodd@gmail.com