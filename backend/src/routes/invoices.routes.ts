import { Router } from 'express';
import { getInvoices, getInvoiceById, createInvoice } from '../controllers/invoices.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);

export default router;
