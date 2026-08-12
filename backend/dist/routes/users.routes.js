"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Protect all user management routes, restrict to ADMIN only
router.use(auth_middleware_1.authenticateJWT);
router.use((0, auth_middleware_1.requireRole)(['ADMIN']));
router.get('/', users_controller_1.getUsers);
router.post('/', users_controller_1.createUser);
router.put('/:id', users_controller_1.updateUser);
router.delete('/:id', users_controller_1.deleteUser);
exports.default = router;
