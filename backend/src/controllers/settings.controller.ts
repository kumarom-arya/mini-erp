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

export const resetSystemData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Delete in order to satisfy FK constraints
    await prisma.payment.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.challanEditRequest.deleteMany();
    await prisma.challanItem.deleteMany();
    await prisma.challan.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.settings.deleteMany();

    res.json({ message: 'All company data has been completely reset!' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to reset system data', details: error.message });
  }
};
