import { Router } from 'express';
import { getSettings, updateSettings, resetSystemData } from '../controllers/settings.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/reset', requireRole(['ADMIN']), resetSystemData);

export default router;
