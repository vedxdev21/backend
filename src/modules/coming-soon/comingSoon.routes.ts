import { Router } from 'express';
import * as cs from './comingSoon.controller';
import { optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/services', cs.getAll);
router.get('/services/:serviceId', cs.getDetail);
router.post('/services/:serviceId/notify', optionalAuth, cs.notifyMe);

export default router;
