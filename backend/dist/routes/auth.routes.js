"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
router.post('/seed', auth_controller_1.seedUsers); // A helper endpoint to create initial users
exports.default = router;
