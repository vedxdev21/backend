import { Router } from 'express';
import * as ac from './admin.controller';
import { authenticate, adminOnly } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

router.post('/login', authLimiter, ac.login);

// All routes below require admin auth
router.use(authenticate, adminOnly);

router.get('/dashboard', ac.dashboard);

// Users
router.get('/users', ac.getUsers);
router.get('/users/:id', ac.getUserDetail);
router.patch('/users/:id/verify', ac.verifyUser);
router.patch('/users/:id/block', ac.blockUser);
router.delete('/users/:id', ac.deleteUser);

// Properties
router.get('/properties', ac.getProperties);
router.patch('/properties/:id/approve', ac.approveProperty);
router.patch('/properties/:id/reject', ac.rejectProperty);
router.patch('/properties/:id/feature', ac.featureProperty);
router.delete('/properties/:id', ac.deleteProperty);

// Mess
router.get('/mess', ac.getMess);
router.patch('/mess/:id/verify', ac.verifyMess);
router.delete('/mess/:id', ac.deleteMess);

// Cooks
router.get('/cooks', ac.getCooks);
router.patch('/cooks/:id/verify', ac.verifyCook);
router.delete('/cooks/:id', ac.deleteCook);

// Reviews
router.get('/reviews', ac.getReviews);
router.patch('/reviews/:id/hide', ac.hideReview);
router.patch('/reviews/:id/feature', ac.featureReview);
router.delete('/reviews/:id', ac.deleteReview);

// Reports
router.get('/reports', ac.getReports);
router.patch('/reports/:id', ac.updateReport);

// Notifications
router.post('/notifications/send', ac.sendNotification);

// Analytics
router.get('/analytics', ac.analytics);
router.get('/coming-soon/stats', ac.comingSoonStats);

// Settings
router.get('/settings', ac.getSettings);
router.put('/settings', ac.updateSettings);

export default router;
