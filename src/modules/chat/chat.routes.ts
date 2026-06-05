import { Router } from 'express';
import * as chatController from './chat.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:id', chatController.getMessages);
router.post('/conversations', chatController.startConversation);
router.post('/conversations/:id/messages', chatController.sendMessage);

export default router;
