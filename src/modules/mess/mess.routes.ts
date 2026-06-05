import { Router } from 'express';
import * as mc from './mess.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

// Auth-required routes (must come before /:id wildcard routes)
router.get('/saved', authenticate, mc.getSaved);
router.get('/dashboard', authenticate, mc.dashboard);
router.post('/register', authenticate, mc.register);
router.put('/:id', authenticate, mc.update);
router.delete('/:id', authenticate, mc.remove);
router.post('/menu', authenticate, mc.updateMenu);
router.post('/:id/save', authenticate, mc.toggleSave);

// Public / optional-auth routes
router.get('/', optionalAuth, mc.browse);
router.get('/:id/menu', optionalAuth, mc.getMenu);
router.get('/:id', optionalAuth, mc.getById);

export default router;
