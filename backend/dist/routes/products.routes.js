"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("../controllers/products.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT);
router.get('/', products_controller_1.getProducts);
router.get('/movements', products_controller_1.getStockMovements); // Get logs of stock movements
router.get('/:id', products_controller_1.getProductById);
router.post('/', (0, auth_middleware_1.requireRole)(['ADMIN', 'WAREHOUSE']), products_controller_1.createProduct);
router.put('/:id', (0, auth_middleware_1.requireRole)(['ADMIN', 'WAREHOUSE']), products_controller_1.updateProduct);
exports.default = router;
