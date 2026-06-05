import { Router } from 'express';
import * as pc from './property.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createPropertySchema, updatePropertySchema, inquirySchema, alertSchema, propertyQuerySchema } from './property.validation';

const router = Router();

// Auth-required routes (MUST come BEFORE /:id wildcard)
router.get('/my-listings', authenticate, pc.myListings);
router.get('/saved', authenticate, pc.getSaved);
router.get('/alerts', authenticate, pc.getAlerts);
router.get('/owner/dashboard', authenticate, pc.ownerDashboard);
router.get('/compare', optionalAuth, pc.compare);

router.post('/', authenticate, validate(createPropertySchema), pc.create);
router.post('/alerts', authenticate, validate(alertSchema), pc.createAlert);
router.delete('/alerts/:id', authenticate, pc.deleteAlert);

// Public / optional-auth routes (browsing) — wildcard AFTER specific routes
router.get('/', optionalAuth, validate(propertyQuerySchema, 'query'), pc.browse);
router.get('/:id', optionalAuth, pc.getById);

router.put('/:id', authenticate, validate(updatePropertySchema), pc.update);
router.delete('/:id', authenticate, pc.remove);
router.patch('/:id/status', authenticate, pc.updateStatus);

router.post('/:id/save', authenticate, pc.toggleSave);
router.post('/:id/inquiry', authenticate, validate(inquirySchema), pc.sendInquiry);
router.get('/:id/inquiries', authenticate, pc.getInquiries);
router.post('/:id/show-number', authenticate, pc.showNumber);

export default router;
