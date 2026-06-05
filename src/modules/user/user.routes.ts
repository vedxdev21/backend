import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { profileSetupSchema, updateProfileSchema, updateLocationSchema } from './user.validation';
import { uploadSingle } from '../../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/upload-image', uploadSingle, userController.uploadImage);
router.get('/me', userController.getMe);
router.put('/profile-setup', validate(profileSetupSchema), userController.setupProfile);
router.put('/me', validate(updateProfileSchema), userController.updateProfile);
router.put('/me/location', validate(updateLocationSchema), userController.updateLocation);
router.put('/me/language', userController.updateLanguage);
router.get('/me/stats', userController.getStats);
router.get('/:id', userController.getPublicProfile);

export default router;
