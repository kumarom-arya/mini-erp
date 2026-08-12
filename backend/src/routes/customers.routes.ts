
import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from '../controllers/customers.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateJWT);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);

// Admin, Sales, Warehouse, Accounts might all need customer access depending on strictness,
// but let's say everyone can view, and ADMIN/SALES can create/update.
router.post('/', requireRole(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', requireRole(['ADMIN', 'SALES']), updateCustomer);

export default router;
