import { Router } from 'express';
import * as rc from './review.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/:targetType/:targetId', rc.getReviews);
router.post('/', rc.create);
router.put('/:id', rc.update);
router.delete('/:id', rc.remove);

export default router;
