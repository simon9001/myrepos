import { Hono } from 'hono';
import { MarketController } from '../controllers/market.js';
import { authMiddleware, buyerOnly, farmerOnly, adminOnly } from '../middleware/authMiddleware.js';

export const marketRoutes = new Hono();

// Public / Common
marketRoutes.get('/requests', MarketController.getRequests);
marketRoutes.get('/products', MarketController.getPublicProducts);
marketRoutes.get('/products/:id', MarketController.getProductDetails);

// Protected
marketRoutes.use('/*', authMiddleware);

// Buyer Routes
marketRoutes.post('/requests', buyerOnly, MarketController.createRequest);
marketRoutes.get('/requests/:requestId/offers', buyerOnly, MarketController.getOffers);
marketRoutes.post('/products/:id/bid', buyerOnly, MarketController.placeBid);
marketRoutes.post('/products/purchase', buyerOnly, MarketController.purchaseDirect);
marketRoutes.get('/my-orders', buyerOnly, MarketController.getMyOrders);
marketRoutes.get('/my-bids', buyerOnly, MarketController.getMyBids);

// Farmer Routes
marketRoutes.post('/requests/:requestId/offers', farmerOnly, MarketController.submitOffer);

// Admin Routes
marketRoutes.post('/requests/:requestId/aggregate', adminOnly, MarketController.confirmAggregation);
