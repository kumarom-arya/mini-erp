"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: 'Username and password are required' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { username } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const seedUsers = async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.count();
        if (users > 0) {
            res.status(400).json({ error: 'Users already seeded' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash('password123', 10);
        const roles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
        for (const role of roles) {
            await prisma_1.prisma.user.create({
                data: {
                    username: role.toLowerCase(),
                    password: passwordHash,
                    role,
                }
            });
        }
        res.json({ message: 'Users seeded successfully (password: password123)' });
    }
    catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.seedUsers = seedUsers;
