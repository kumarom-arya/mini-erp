import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const seedUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.count();
    if (users > 0) {
      res.status(400).json({ error: 'Users already seeded' });
      return;
    }

    const passwordHash = await bcrypt.hash('password123', 10);
    const roles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
    
    for (const role of roles) {
      await prisma.user.create({
        data: {
          username: role.toLowerCase(),
          password: passwordHash,
          role,
        }
      });
    }

    res.json({ message: 'Users seeded successfully (password: password123)' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
