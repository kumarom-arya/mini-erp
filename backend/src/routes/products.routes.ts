import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, getStockMovements } from '../controllers/products.controller';
import { authenticateJWT, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProducts);
router.get('/movements', getStockMovements); // Get logs of stock movements
router.get('/:id', getProductById);

router.post('/', requireRole(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', requireRole(['ADMIN', 'WAREHOUSE']), updateProduct);

export default router;
