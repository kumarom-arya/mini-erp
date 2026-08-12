import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        challan: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        customer: true,
        challan: {
          include: {
            items: true
          }
        },
        payments: true,
      },
    });
    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challanId, customerId, taxAmount, discount } = req.body;
    // Assuming req.user is set by auth middleware
    const userId = (req as any).user?.id; 

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // First fetch the challan and its items to calculate total
    const challan = await prisma.challan.findUnique({
      where: { id: challanId },
      include: { items: true }
    });

    if (!challan) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    let totalAmount = 0;
    challan.items.forEach(item => {
      totalAmount += item.quantity * item.unitPrice;
    });

    const grandTotal = totalAmount + (taxAmount || 0) - (discount || 0);
    
    // Generate Invoice Number
    const count = await prisma.invoice.count();
    const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        challanId,
        customerId,
        totalAmount,
        taxAmount: taxAmount || 0,
        discount: discount || 0,
        grandTotal,
        status: 'UNPAID',
        createdById: userId,
      },
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to create invoice', details: error.message });
  }
};
