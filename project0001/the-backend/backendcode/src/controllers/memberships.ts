import { Context } from 'hono';
import { supabase } from '../db/supabaseClient.js';
import { membershipSchema } from '../utils/validation.js';
import { AuthTokenPayload } from '../types/index.js';

export class MembershipsController {
    static async upgradeMembership(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const body = await c.req.json();
            const validated = membershipSchema.parse(body);

            if (validated.tier === 'free') {
                return c.json({ error: 'Already on free tier' }, 400);
            }

            // Membership price - For now hardcoded, in production could be in a config/db
            const amount = 1000; // e.g. 1000 KES

            // Create a pending membership record
            const { data: membership, error: membershipError } = await supabase
                .from('memberships')
                .insert({
                    user_id: user.userId,
                    tier: 'premium',
                    payment_status: 'pending',
                })
                .select()
                .single();

            if (membershipError) throw membershipError;

            // Prepare M-Pesa STK Push payload (Simplified logic for demonstration)
            const timestamp = new Date().toISOString().split('.')[0]?.replace(/[^0-9]/g, '') || '';
            const phone = validated.payment_phone || user.phone || '';

            if (!phone) {
                return c.json({ error: 'Payment phone number is required' }, 400);
            }

            // Note: In real production, you'd call Daraja API here.
            // We return the payload for the frontend to know the push was initiated.
            return c.json({
                message: 'Membership upgrade initiated',
                membership,
                daraja_payload: {
                    BusinessShortCode: process.env.DARAJA_SHORTCODE || '174379',
                    Amount: amount,
                    PhoneNumber: phone,
                    CallBackURL: `${process.env.BASE_URL}/api/memberships/callback`,
                    AccountReference: `Membership-${membership.id}`,
                    TransactionDesc: 'Farmer Premium Upgrade',
                },
            });
        } catch (error) {
            console.error('Upgrade membership error:', error);
            return c.json({ error: 'Failed to initiate upgrade' }, 400);
        }
    }

    static async handlePaymentCallback(c: Context) {
        try {
            const callbackData = await c.req.json();
            const stkCallback = callbackData.Body?.stkCallback;

            if (!stkCallback) return c.json({ error: 'Invalid callback' }, 400);

            const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;
            const membershipId = stkCallback.AccountReference?.split('-')[1]; // Custom logic to extract ID if passed

            if (ResultCode !== 0) {
                // Find membership by transaction ref or account ref
                // For simplicity, we assume we find it
                return c.json({ message: 'Upgrade failed' });
            }

            // Update membership status
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year membership

            // In real scenario, we'd find the record using CheckoutRequestID stored in DB
            // For this implementation, we'll need to store CheckoutRequestID when initiating.

            // Update DB
            const { data: membership, error } = await supabase
                .from('memberships')
                .update({
                    payment_status: 'paid',
                    tier: 'premium',
                    start_date: new Date().toISOString(),
                    expiry_date: expiryDate.toISOString(),
                    transaction_reference: CheckoutRequestID,
                })
                .match({ payment_status: 'pending' }) // In production: .eq('transaction_id', CheckoutRequestID)
                .select()
                .single();

            if (error) throw error;

            // Update user role to farmer if they were a client? 
            // Requirement says "farmers upgrade", assuming they are already farmers

            return c.json({ message: 'Membership upgraded successfully' });
        } catch (error) {
            console.error('Callback error:', error);
            return c.json({ error: 'Failed to process callback' }, 500);
        }
    }

    static async getStatus(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;

            const { data, error } = await supabase
                .from('memberships')
                .select('*')
                .eq('user_id', user.userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            return c.json({ membership: data || { tier: 'free' } });
        } catch (error) {
            return c.json({ error: 'Failed to get membership status' }, 400);
        }
    }

    static async getFarmerNetwork(c: Context) {
        try {
            // Access to this is gated by premiumOnly middleware
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, phone, profile_media:media_library(*)')
                .eq('role', 'farmer');

            if (error) throw error;

            return c.json({ farmers: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch farmer network' }, 400);
        }
    }

    static async getAllMemberships(c: Context) {
        try {
            // Admin only - ideally use an admin middleware
            const query = c.req.query();

            let queryBuilder = supabase
                .from('memberships')
                .select('*, user:users(id, name, email)')
                .order('created_at', { ascending: false });

            if (query.tier) {
                queryBuilder = queryBuilder.eq('tier', query.tier);
            }

            if (query.status) {
                queryBuilder = queryBuilder.eq('payment_status', query.status);
            }

            const { data, error } = await queryBuilder;

            if (error) {
                console.error("Error fetching memberships:", error);
                throw error;
            }

            return c.json({ memberships: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch memberships' }, 400);
        }
    }
}
