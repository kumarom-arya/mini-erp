import { Router } from 'express';
import { getChallans, getChallanById, createChallan, updateChallanStatus } from '../controllers/challans.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getChallans);
router.get('/:id', getChallanById);

router.post('/', requireRole(['ADMIN', 'SALES']), createChallan);
router.put('/:id/status', requireRole(['ADMIN', 'SALES']), updateChallanStatus);

import { createEditRequest } from '../controllers/edit-requests.controller';
router.post('/:challanId/edit-request', requireRole(['ADMIN', 'SALES']), createEditRequest);

export default router;
