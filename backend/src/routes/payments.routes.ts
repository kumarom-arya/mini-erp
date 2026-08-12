import { Router } from 'express';
import { getPayments, createPayment } from '../controllers/payments.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getPayments);
router.post('/', createPayment);

export default router;
