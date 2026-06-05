import { Router } from 'express';
import * as cc from './cook.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

// Auth-required routes (MUST come BEFORE /:id wildcard)
router.get('/saved', authenticate, cc.getSaved);
router.get('/dashboard', authenticate, cc.dashboard);
router.post('/register', authenticate, cc.register);

// Public / optional-auth routes
router.get('/', optionalAuth, cc.browse);
router.get('/:id', optionalAuth, cc.getById);

router.put('/:id', authenticate, cc.update);
router.delete('/:id', authenticate, cc.remove);
router.post('/:id/save', authenticate, cc.toggleSave);

export default router;
