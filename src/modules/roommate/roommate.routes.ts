import { Router } from 'express';
import * as rc from './roommate.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createRoommateProfileSchema, updateRoommateProfileSchema, interestSchema } from './roommate.validation';

const router = Router();

// Auth-required routes (MUST come BEFORE /:id wildcard)
router.get('/interests', authenticate, rc.getInterests);
router.get('/connections', authenticate, rc.getConnections);
router.get('/groups', authenticate, rc.browseGroups);

router.post('/profile', authenticate, validate(createRoommateProfileSchema), rc.create);
router.put('/profile', authenticate, validate(updateRoommateProfileSchema), rc.update);
router.delete('/profile', authenticate, rc.remove);

router.post('/groups', authenticate, rc.createGroup);
router.post('/groups/:id/join', authenticate, rc.joinGroup);
router.delete('/groups/:id/leave', authenticate, rc.leaveGroup);

router.put('/interests/:id/respond', authenticate, rc.respondToInterest);

// Public / optional-auth routes (browsing) — wildcard AFTER specific routes
router.get('/', optionalAuth, rc.browse);
router.get('/:id', optionalAuth, rc.getById);
router.post('/:id/interest', authenticate, validate(interestSchema), rc.sendInterest);

export default router;
