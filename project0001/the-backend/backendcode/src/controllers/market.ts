import { Context } from 'hono';
import { supabase } from '../db/supabaseClient.js';
import { marketRequestSchema, supplyOfferSchema } from '../utils/validation.js';
import { AuthTokenPayload } from '../types/index.js';

export class MarketController {
    // Buyer: Submit produce request
    static async createRequest(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const body = await c.req.json();
            const validated = marketRequestSchema.parse(body);

            const { data, error } = await supabase
                .from('market_requests')
                .insert({
                    buyer_id: user.userId,
                    ...validated,
                    status: 'open',
                })
                .select()
                .single();

            if (error) throw error;

            // Notify relevant farmers (Simple placeholder logic)
            // In production, you would fetch farmers interested in these crop types

            return c.json({ message: 'Market request posted', request: data });
        } catch (error) {
            console.error('Create request error:', error);
            return c.json({ error: 'Failed to post request' }, 400);
        }
    }

    // Common: List requests
    static async getRequests(c: Context) {
        try {
            const { status } = c.req.query();
            let query = supabase.from('market_requests').select(`
        *,
        buyer:users!market_requests_buyer_id_fkey(name, email)
      `);

            if (status) query = query.eq('status', status);

            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;

            return c.json({ requests: data });
        } catch (error) {
            return c.json({ error: 'Failed' }, 400);
        }
    }

    // Farmer: Submit supply offer
    static async submitOffer(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const requestId = c.req.param('requestId');
            const body = await c.req.json();
            const validated = supplyOfferSchema.parse(body);

            // Check if request is still open
            const { data: request } = await supabase
                .from('market_requests')
                .select('status')
                .eq('id', requestId)
                .single();

            if (!request || request.status !== 'open') {
                return c.json({ error: 'Request is no longer open for offers' }, 400);
            }

            const { data, error } = await supabase
                .from('supply_offers')
                .insert({
                    request_id: requestId,
                    farmer_id: user.userId,
                    ...validated,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;

            return c.json({ message: 'Supply offer submitted', offer: data });
        } catch (error) {
            return c.json({ error: 'Failed to submit offer' }, 400);
        }
    }

    // Buyer/Admin: Get offers for a request
    static async getOffers(c: Context) {
        try {
            const requestId = c.req.param('requestId');
            const { data, error } = await supabase
                .from('supply_offers')
                .select(`
          *,
          farmer:users!supply_offers_farmer_id_fkey(name, phone, email)
        `)
                .eq('request_id', requestId);

            if (error) throw error;
            return c.json({ offers: data });
        } catch (error) {
            return c.json({ error: 'Failed' }, 400);
        }
    }

    // Admin: Aggregation flow (Accept multiple offers)
    static async confirmAggregation(c: Context) {
        try {
            const requestId = c.req.param('requestId');
            const { offerIds } = await c.req.json(); // Array of accepted offer IDs

            // 1. Update accepted offers
            await supabase
                .from('supply_offers')
                .update({ status: 'accepted' })
                .in('id', offerIds);

            // 2. Reject others? (Optional)

            // 3. Update request status
            const { data: request, error } = await supabase
                .from('market_requests')
                .update({ status: 'confirmed' })
                .eq('id', requestId)
                .select()
                .single();

            if (error) throw error;

            return c.json({ message: 'Market request matched and confirmed', request });
        } catch (error) {
            return c.json({ error: 'Failed to aggregate' }, 400);
        }
    }

    // --- E-COMMERCE & AUCTION METHODS ---

    /**
     * Get all published products.
     */
    static async getPublicProducts(c: Context) {
        try {
            const { status, category } = c.req.query();

            // Join with memberships to get the farmer's tier for ranking
            let query = supabase
                .from('market_products')
                .select(`
                    *,
                    farmer:users(
                        id, 
                        name,
                        memberships(tier)
                    )
                `)
                .eq('is_published', true);

            if (status) query = query.eq('status', status);
            if (category) query = query.eq('crop_type', category);

            // Priority Ranking: Premium first, then by creation date
            // Note: Postgres treats 'premium' > 'free' alphabetically if we order by tier desc? 
            // Better to use a specific ordering logic if possible, but here we can rely on 
            // ordering by membership(tier) if we map tiers to numbers or use a case statement in a real SQL query.
            // With PostgREST, we can order by the joined field.

            const { data, error } = await query
                .order('created_at', { ascending: false });

            if (error) throw error;

            return c.json({ products: data });
        } catch (error) {
            console.error('Fetch public products error:', error);
            return c.json({ error: 'Failed to fetch products' }, 400);
        }
    }

    /**
     * Get a single product with its highest bid.
     */
    static async getProductDetails(c: Context) {
        try {
            const id = c.req.param('id');
            const { data: product, error } = await supabase
                .from('market_products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Get highest bid if auction
            let highestBid = null;
            if (product.auction_enabled) {
                const { data: bid } = await supabase
                    .from('market_bids')
                    .select('amount')
                    .eq('product_id', id)
                    .order('amount', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                highestBid = bid?.amount || product.starting_bid_price;
            }

            return c.json({ product, highest_bid: highestBid });
        } catch (error) {
            return c.json({ error: 'Failed to fetch product details' }, 400);
        }
    }

    /**
     * Place a bid on an auction.
     */
    static async placeBid(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const productId = c.req.param('id');
            const { amount } = await c.req.json();

            // 1. Get product info
            const { data: product, error: prodError } = await supabase
                .from('market_products')
                .select('*')
                .eq('id', productId)
                .single();

            if (prodError || !product.auction_enabled) {
                return c.json({ error: 'Auction not enabled for this product' }, 400);
            }

            // 2. Validate auction date
            if (product.auction_end_date && new Date(product.auction_end_date) < new Date()) {
                return c.json({ error: 'Auction has ended' }, 400);
            }

            // 3. Validate bid amount
            const { data: highestBid } = await supabase
                .from('market_bids')
                .select('amount')
                .eq('product_id', productId)
                .order('amount', { ascending: false })
                .limit(1)
                .maybeSingle();

            const minBid = highestBid ? highestBid.amount : product.starting_bid_price;
            if (amount <= minBid) {
                return c.json({ error: `Bid must be higher than ${minBid}` }, 400);
            }

            // 4. Insert bid
            const { data, error } = await supabase
                .from('market_bids')
                .insert({
                    product_id: productId,
                    user_id: user.userId,
                    amount
                })
                .select()
                .single();

            if (error) throw error;

            return c.json({ message: 'Bid placed successfully', bid: data });
        } catch (error) {
            return c.json({ error: 'Failed to place bid' }, 400);
        }
    }

    /**
     * Direct purchase (Fixed price).
     */
    static async purchaseDirect(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const body = await c.req.json();
            const { product_id, shipping_address } = body;

            // 1. Get product price
            const { data: product, error: prodError } = await supabase
                .from('market_products')
                .select('price, farmer_id, auction_enabled')
                .eq('id', product_id)
                .single();

            if (prodError || product.auction_enabled || !product.price) {
                return c.json({ error: 'Direct purchase not available for this product' }, 400);
            }

            // 1.5 Get Farmer's membership for commission calculation
            const { data: membership } = await supabase
                .from('memberships')
                .select('commission_rate')
                .eq('user_id', product.farmer_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const commissionRate = membership?.commission_rate || 10.00;
            const commissionAmount = (product.price * commissionRate) / 100;

            // 2. Create order
            const { data, error } = await supabase
                .from('market_orders')
                .insert({
                    product_id,
                    user_id: user.userId,
                    farmer_id: product.farmer_id,
                    order_type: 'direct',
                    amount: product.price,
                    commission_rate: commissionRate,
                    commission_amount: commissionAmount,
                    shipping_address,
                    payment_status: 'pending_payment',
                    delivery_status: 'upcoming'
                })
                .select()
                .single();

            if (error) throw error;

            return c.json({ message: 'Order created', order: data });
        } catch (error) {
            return c.json({ error: 'Failed to create order' }, 400);
        }
    }

    /**
     * Get buyer's orders.
     */
    static async getMyOrders(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const { data, error } = await supabase
                .from('market_orders')
                .select(`
                    *,
                    product:market_products(name, crop_type, harvest_date, status, images)
                `)
                .eq('user_id', user.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return c.json({ orders: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch orders' }, 400);
        }
    }

    /**
     * Get buyer's active bids.
     */
    static async getMyBids(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const { data, error } = await supabase
                .from('market_bids')
                .select(`
                    *,
                    product:market_products(name, auction_end_date, status)
                `)
                .eq('user_id', user.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return c.json({ bids: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch bids' }, 400);
        }
    }
}

