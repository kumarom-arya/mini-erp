import { Router } from 'express';
import { createEditRequest, getEditRequests, resolveEditRequest } from '../controllers/edit-requests.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateJWT);

// Both ADMIN and SALES can view edit requests
router.get('/', requireRole(['ADMIN', 'SALES']), getEditRequests);

// Only ADMIN can resolve edit requests
router.post('/:id/resolve', requireRole(['ADMIN']), resolveEditRequest);

export default router;
