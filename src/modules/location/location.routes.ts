import { Router } from 'express';
import * as locationController from './location.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/cities', locationController.getCities);
router.get('/cities/:city/areas', locationController.getAreas);
router.post('/detect', locationController.detectLocation);
router.get('/area-guide/:city', authenticate, locationController.getAreaGuide);

export default router;
