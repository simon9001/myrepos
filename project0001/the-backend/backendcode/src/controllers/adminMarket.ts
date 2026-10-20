import { Context } from 'hono';
import { supabase } from '../db/supabaseClient.js';
import { marketProductSchema } from '../utils/validation.js';
import { AuthTokenPayload } from '../types/index.js';

export class AdminMarketController {
    /**
     * Create a new market product (Direct or Auction).
     */
    static async createProduct(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const body = await c.req.json();
            const validated = marketProductSchema.parse(body);

            // 1. Get user's membership tier and listing limit
            const { data: membership } = await supabase
                .from('memberships')
                .select('tier, listing_limit')
                .eq('user_id', user.userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const tier = membership?.tier || 'free';
            const limit = membership?.listing_limit || 3;

            // 2. Count current active products for this farmer
            const { count, error: countError } = await supabase
                .from('market_products')
                .select('*', { count: 'exact', head: true })
                .eq('farmer_id', user.userId)
                .eq('is_published', true);

            if (countError) throw countError;

            if (tier === 'free' && count !== null && count >= limit && (validated.is_published !== false)) {
                return c.json({
                    error: `Listing limit reached. Free farmers can have a maximum of ${limit} active listings. Upgrade to Premium for unlimited listings.`,
                    code: 'LIMIT_REACHED'
                }, 403);
            }

            const { data, error } = await supabase
                .from('market_products')
                .insert({
                    ...validated,
                    farmer_id: user.userId,
                    is_published: validated.is_published ?? false
                })
                .select()
                .single();

            if (error) throw error;

            return c.json({ message: 'Product created successfully', product: data });
        } catch (error) {
            console.error('Admin create product error:', error);
            return c.json({ error: 'Failed to create product' }, 400);
        }
    }

    /**
     * Update an existing product (Price, Logistics Status, etc.).
     */
    static async updateProduct(c: Context) {
        try {
            const id = c.req.param('id');
            const body = await c.req.json();
            const validated = marketProductSchema.partial().parse(body);

            const { data, error } = await supabase
                .from('market_products')
                .update(validated)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return c.json({ message: 'Product updated successfully', product: data });
        } catch (error) {
            console.error('Admin update product error:', error);
            return c.json({ error: 'Failed to update product' }, 400);
        }
    }

    /**
     * Delete a product.
     */
    static async deleteProduct(c: Context) {
        try {
            const id = c.req.param('id');
            const { error } = await supabase
                .from('market_products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return c.json({ message: 'Product deleted successfully' });
        } catch (error) {
            return c.json({ error: 'Failed to delete product' }, 400);
        }
    }

    /**
     * Get all products (Admin view).
     */
    static async getAllProducts(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            let query = supabase
                .from('market_products')
                .select('*')
                .order('created_at', { ascending: false });

            // If not admin, only show own products
            if (user.role !== 'admin') {
                query = query.eq('farmer_id', user.userId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return c.json({ products: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch products' }, 400);
        }
    }

    /**
     * Get all bids for a specific product.
     */
    static async getProductBids(c: Context) {
        try {
            const productId = c.req.param('id');
            const { data, error } = await supabase
                .from('market_bids')
                .select('*, user:users(name, email, phone)')
                .eq('product_id', productId)
                .order('amount', { ascending: false });

            if (error) throw error;

            return c.json({ bids: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch bids' }, 400);
        }
    }

    /**
     * Close an auction manually and confirm the winner.
     */
    static async closeAuction(c: Context) {
        try {
            const productId = c.req.param('id');

            // 1. Get highest bid
            const { data: highestBid, error: bidError } = await supabase
                .from('market_bids')
                .select('*')
                .eq('product_id', productId)
                .order('amount', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (bidError) throw bidError;
            if (!highestBid) {
                return c.json({ error: 'No bids found for this auction' }, 400);
            }

            // 2. Create order for winner
            const { error: orderError } = await supabase
                .from('market_orders')
                .insert({
                    product_id: productId,
                    user_id: highestBid.user_id,
                    bid_id: highestBid.id,
                    order_type: 'auction',
                    amount: highestBid.amount,
                    payment_status: 'pending_payment',
                    auction_status: 'won'
                });

            if (orderError) throw orderError;

            // 3. Update product status? (Optional, maybe mark as sold)

            return c.json({ message: 'Auction closed and winner confirmed' });
        } catch (error) {
            return c.json({ error: 'Failed to close auction' }, 400);
        }
    }
}
