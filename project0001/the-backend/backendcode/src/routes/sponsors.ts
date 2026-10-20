import { Hono } from 'hono';
import { SponsorsController } from '../controllers/sponsors.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

export const sponsorRoutes = new Hono();

// ─── PUBLIC ROUTES (no auth required) ───────────────────────────
sponsorRoutes.get('/public-list', SponsorsController.getPublicSponsors);

// ─── PROTECTED ROUTES (auth required) ──────────────────────────
sponsorRoutes.use('/*', authMiddleware);

sponsorRoutes.post('/apply', SponsorsController.apply);
sponsorRoutes.get('/my-application', SponsorsController.getApplication);
sponsorRoutes.get('/my-sponsorship', SponsorsController.getActiveSponsorship);

// ─── ADMIN ROUTES ──────────────────────────────────────────────
sponsorRoutes.get('/applications', adminOnly, SponsorsController.getAllApplications);
sponsorRoutes.patch('/applications/:id/review', adminOnly, SponsorsController.reviewApplication);
sponsorRoutes.post('/sponsorships', adminOnly, SponsorsController.createSponsorship);
sponsorRoutes.get('/sponsorships', adminOnly, SponsorsController.getAllSponsorships);
sponsorRoutes.patch('/sponsorships/:id/status', adminOnly, SponsorsController.updateSponsorshipStatus);
