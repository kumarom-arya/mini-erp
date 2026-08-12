"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const edit_requests_controller_1 = require("../controllers/edit-requests.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Apply auth middleware to all routes
router.use(auth_middleware_1.authenticateJWT);
// Both ADMIN and SALES can view edit requests
router.get('/', (0, auth_middleware_1.requireRole)(['ADMIN', 'SALES']), edit_requests_controller_1.getEditRequests);
// Only ADMIN can resolve edit requests
router.post('/:id/resolve', (0, auth_middleware_1.requireRole)(['ADMIN']), edit_requests_controller_1.resolveEditRequest);
exports.default = router;
