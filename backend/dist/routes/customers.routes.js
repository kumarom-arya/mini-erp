"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("../controllers/customers.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authenticateJWT);
router.get('/', customers_controller_1.getCustomers);
router.get('/:id', customers_controller_1.getCustomerById);
// Admin, Sales, Warehouse, Accounts might all need customer access depending on strictness,
// but let's say everyone can view, and ADMIN/SALES can create/update.
router.post('/', (0, auth_middleware_1.requireRole)(['ADMIN', 'SALES']), customers_controller_1.createCustomer);
router.put('/:id', (0, auth_middleware_1.requireRole)(['ADMIN', 'SALES']), customers_controller_1.updateCustomer);
exports.default = router;
