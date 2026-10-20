import { Hono } from 'hono';
import { MembershipsController } from '../controllers/memberships.js';
import { authMiddleware, premiumOnly, farmerOnly } from '../middleware/authMiddleware.js';

export const membershipRoutes = new Hono();

// Public callback (no auth)
membershipRoutes.post('/callback', MembershipsController.handlePaymentCallback);

// Protected routes
membershipRoutes.use('/*', authMiddleware);

membershipRoutes.get('/status', MembershipsController.getStatus);
membershipRoutes.post('/upgrade', farmerOnly, MembershipsController.upgradeMembership);
membershipRoutes.get('/network', premiumOnly, MembershipsController.getFarmerNetwork);
membershipRoutes.get('/all', MembershipsController.getAllMemberships);
