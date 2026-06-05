import { Router } from 'express';
import * as nc from './notification.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', nc.getAll);
router.get('/unread-count', nc.getUnreadCount);
router.patch('/:id/read', nc.markRead);
router.patch('/read-all', nc.markAllRead);

export default router;
