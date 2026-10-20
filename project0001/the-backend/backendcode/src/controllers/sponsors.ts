import { Context } from 'hono';
import { supabase } from '../db/supabaseClient.js';
import { sponsorApplicationSchema, sponsorshipSchema } from '../utils/validation.js';
import { AuthTokenPayload } from '../types/index.js';

export class SponsorsController {
    // ─── SPONSOR APPLICATION ────────────────────────────────────────

    /**
     * Submit a sponsor application.
     * No one becomes a sponsor automatically — approval is manual.
     */
    static async apply(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const body = await c.req.json();
            const validated = sponsorApplicationSchema.parse(body);

            // Check if already has an application
            const { data: existing } = await supabase
                .from('sponsor_applications')
                .select('id, status')
                .eq('user_id', user.userId)
                .maybeSingle();

            if (existing) {
                return c.json({
                    error: 'You already have a sponsor application',
                    status: existing.status,
                    application_id: existing.id,
                }, 400);
            }

            const { data, error } = await supabase
                .from('sponsor_applications')
                .insert({
                    user_id: user.userId,
                    ...validated,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;

            return c.json({
                message: 'Sponsor application submitted for review',
                application: data,
            });
        } catch (error) {
            console.error('Sponsor application error:', error);
            return c.json({ error: 'Failed to submit application' }, 400);
        }
    }

    /**
     * Get the current user's sponsor application.
     */
    static async getApplication(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;
            const { data, error } = await supabase
                .from('sponsor_applications')
                .select('*')
                .eq('user_id', user.userId)
                .maybeSingle();

            if (error) throw error;
            return c.json({ application: data || null });
        } catch (error) {
            return c.json({ error: 'Failed to get application' }, 400);
        }
    }

    /**
     * Get the current user's active sponsorship contract.
     */
    static async getActiveSponsorship(c: Context) {
        try {
            const user = c.get('user') as AuthTokenPayload;

            // First get the user's approved application
            const { data: application } = await supabase
                .from('sponsor_applications')
                .select('id')
                .eq('user_id', user.userId)
                .eq('status', 'approved')
                .maybeSingle();

            if (!application) {
                return c.json({ sponsorships: [] });
            }

            const { data, error } = await supabase
                .from('sponsorships')
                .select('*')
                .eq('sponsor_id', application.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return c.json({ sponsorships: data });
        } catch (error) {
            return c.json({ error: 'Failed to get sponsorships' }, 400);
        }
    }

    // ─── PUBLIC ─────────────────────────────────────────────────────

    /**
     * Get all publicly visible sponsors.
     * A sponsor is only visible if:
     *   - application.status = 'approved'
     *   - sponsorship.status = 'active'
     *   - payment_status = 'paid'
     *   - current_date BETWEEN start_date AND end_date
     */
    static async getPublicSponsors(c: Context) {
        try {
            const today = new Date().toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('sponsorships')
                .select(`
                    id,
                    package_type,
                    tier,
                    start_date,
                    end_date,
                    sponsor:sponsor_applications!inner(
                        id,
                        company_name,
                        website,
                        description,
                        product_category,
                        contact_email
                    )
                `)
                .eq('status', 'active')
                .eq('payment_status', 'paid')
                .eq('sponsor_applications.status', 'approved')
                .lte('start_date', today)
                .gte('end_date', today)
                .order('tier', { ascending: true });

            if (error) throw error;

            return c.json({ sponsors: data });
        } catch (error) {
            console.error('Error fetching public sponsors:', error);
            return c.json({ error: 'Failed to fetch sponsors' }, 400);
        }
    }

    // ─── ADMIN: APPLICATION MANAGEMENT ──────────────────────────────

    /**
     * Admin: Get all sponsor applications with optional status filter.
     */
    static async getAllApplications(c: Context) {
        try {
            const { status } = c.req.query();

            let query = supabase
                .from('sponsor_applications')
                .select('*, user:users(id, name, email)')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) throw error;

            return c.json({ applications: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch applications' }, 400);
        }
    }

    /**
     * Admin: Review a sponsor application (approve, reject, mark under_review).
     */
    static async reviewApplication(c: Context) {
        try {
            const applicationId = c.req.param('id');
            const user = c.get('user') as AuthTokenPayload;
            const { status, admin_notes } = await c.req.json();

            const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
            if (!validStatuses.includes(status)) {
                return c.json({
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                }, 400);
            }

            const updateData: Record<string, unknown> = {
                status,
                reviewed_by: user.userId,
                reviewed_at: new Date().toISOString(),
            };

            if (admin_notes !== undefined) {
                updateData.admin_notes = admin_notes;
            }

            const { data, error } = await supabase
                .from('sponsor_applications')
                .update(updateData)
                .eq('id', applicationId)
                .select('*, user:users(id, name, email)')
                .single();

            if (error) throw error;

            return c.json({
                message: `Application ${status}`,
                application: data,
            });
        } catch (error) {
            console.error('Error reviewing application:', error);
            return c.json({ error: 'Failed to review application' }, 400);
        }
    }

    // ─── ADMIN: SPONSORSHIP CONTRACT MANAGEMENT ─────────────────────

    /**
     * Admin: Create a sponsorship contract for an approved application.
     */
    static async createSponsorship(c: Context) {
        try {
            const body = await c.req.json();
            const validated = sponsorshipSchema.parse(body);

            // Verify the application is approved
            const { data: application } = await supabase
                .from('sponsor_applications')
                .select('id, status')
                .eq('id', validated.sponsor_id)
                .single();

            if (!application) {
                return c.json({ error: 'Sponsor application not found' }, 404);
            }

            if (application.status !== 'approved') {
                return c.json({
                    error: 'Cannot create sponsorship for unapproved application',
                    current_status: application.status,
                }, 400);
            }

            const { data, error } = await supabase
                .from('sponsorships')
                .insert({
                    sponsor_id: validated.sponsor_id,
                    package_type: validated.package_type,
                    tier: validated.tier,
                    start_date: validated.start_date,
                    end_date: validated.end_date,
                    amount: validated.amount,
                    payment_status: 'pending',
                    status: 'pending_payment',
                })
                .select()
                .single();

            if (error) throw error;

            return c.json({
                message: 'Sponsorship contract created',
                sponsorship: data,
            });
        } catch (error) {
            console.error('Error creating sponsorship:', error);
            return c.json({ error: 'Failed to create sponsorship' }, 400);
        }
    }

    /**
     * Admin: Get all sponsorship contracts with optional filters.
     */
    static async getAllSponsorships(c: Context) {
        try {
            const { status, sponsor_id } = c.req.query();

            let query = supabase
                .from('sponsorships')
                .select(`
                    *,
                    sponsor:sponsor_applications(
                        id,
                        company_name,
                        contact_email,
                        status,
                        user:users(id, name, email)
                    )
                `)
                .order('created_at', { ascending: false });

            if (status) query = query.eq('status', status);
            if (sponsor_id) query = query.eq('sponsor_id', sponsor_id);

            const { data, error } = await query;
            if (error) throw error;

            return c.json({ sponsorships: data });
        } catch (error) {
            return c.json({ error: 'Failed to fetch sponsorships' }, 400);
        }
    }

    /**
     * Admin: Update sponsorship contract status (activate, expire, cancel).
     * Also handles payment_status updates.
     */
    static async updateSponsorshipStatus(c: Context) {
        try {
            const sponsorshipId = c.req.param('id');
            const { status, payment_status } = await c.req.json();

            const updateData: Record<string, unknown> = {};

            if (status) {
                const validStatuses = ['pending_payment', 'active', 'expired', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    return c.json({
                        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                    }, 400);
                }
                updateData.status = status;
            }

            if (payment_status) {
                const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
                if (!validPaymentStatuses.includes(payment_status)) {
                    return c.json({
                        error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`,
                    }, 400);
                }
                updateData.payment_status = payment_status;
            }

            if (Object.keys(updateData).length === 0) {
                return c.json({ error: 'No valid fields to update' }, 400);
            }

            const { data, error } = await supabase
                .from('sponsorships')
                .update(updateData)
                .eq('id', sponsorshipId)
                .select(`
                    *,
                    sponsor:sponsor_applications(
                        id, company_name, contact_email
                    )
                `)
                .single();

            if (error) throw error;

            return c.json({
                message: 'Sponsorship updated',
                sponsorship: data,
            });
        } catch (error) {
            console.error('Error updating sponsorship:', error);
            return c.json({ error: 'Failed to update sponsorship' }, 400);
        }
    }
}
