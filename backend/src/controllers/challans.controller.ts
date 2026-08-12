import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const challans = await prisma.challan.findMany({
      include: {
        customer: true,
        createdBy: { select: { id: true, username: true } },
        invoice: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(challans);
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const challan = await prisma.challan.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        customer: true,
        items: true,
        invoice: true,
        createdBy: { select: { id: true, username: true } }
      }
    });
    
    if (!challan) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }
    
    res.json(challan);
  } catch (error) {
    console.error('Error fetching challan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createChallan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId, items, status } = req.body;
    
    if (!customerId || !items || !items.length) {
      res.status(400).json({ error: 'Customer and items are required' });
      return;
    }

    // Auto-generate challan number e.g., CH-2026-0001
    const count = await prisma.challan.count();
    const challanNo = `CH-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Fetch products to store snapshots and check stock if confirming
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    let totalQty = 0;
    const challanItemsData = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      if (status === 'CONFIRMED' && product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }

      totalQty += item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        productName: product.name,
        productSku: product.sku,
        unitPrice: product.unitPrice
      };
    });

    // Run transaction if status is CONFIRMED to reduce stock
    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.create({
        data: {
          challanNo,
          customerId,
          totalQty,
          status: status || 'DRAFT',
          createdById: (req as any).user.id,
          items: {
            create: challanItemsData
          }
        },
        include: { items: true }
      });

      if (challan.status === 'CONFIRMED') {
        for (const item of challanItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });
          
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'OUT',
              reason: `Challan ${challanNo}`,
              createdById: (req as any).user.id
            }
          });
        }
      }

      return challan;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating challan:', error);
    res.status(400).json({ error: error.message || 'Internal server error' });
  }
};

export const updateChallanStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. from DRAFT to CONFIRMED
    
    if (status !== 'CONFIRMED' && status !== 'CANCELLED') {
      res.status(400).json({ error: 'Invalid status update' });
      return;
    }

    const challan = await prisma.challan.findUnique({
      where: { id: parseInt(id as string) },
      include: { items: true }
    });

    if (!challan) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    if (challan.status !== 'DRAFT') {
      res.status(400).json({ error: 'Only DRAFT challans can be updated' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedChallan = await tx.challan.update({
        where: { id: parseInt(id as string) },
        data: { status }
      });

      if (status === 'CONFIRMED') {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productName}`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } }
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: 'OUT',
              reason: `Challan ${challan.challanNo} Confirmed`,
              createdById: (req as any).user.id
            }
          });
        }
      }

      return updatedChallan;
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error updating challan:', error);
    res.status(400).json({ error: error.message || 'Internal server error' });
  }
};
