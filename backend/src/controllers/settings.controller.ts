import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      res.json({});
      return;
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, address, phone, email, gstNumber, logoUrl } = req.body;
    
    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: { companyName, address, phone, email, gstNumber, logoUrl }
      });
    } else {
      settings = await prisma.settings.create({
        data: { companyName, address, phone, email, gstNumber, logoUrl }
      });
    }

    res.json(settings);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to update settings', details: error.message });
  }
};
