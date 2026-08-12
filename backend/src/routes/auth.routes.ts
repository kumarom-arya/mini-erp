import { Router } from 'express';
import { login, seedUsers } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/seed', seedUsers); // A helper endpoint to create initial users

export default router;
