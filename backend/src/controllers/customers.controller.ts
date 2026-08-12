import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search && typeof search === 'string') {
      whereClause = {
        OR: [
          { name: { contains: search } },
          { mobile: { contains: search } },
          { email: { contains: search } },
          { businessName: { contains: search } }
        ]
      };
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id as string) }
    });
    
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    // Basic validation
    if (!data.name || !data.mobile || !data.type) {
      res.status(400).json({ error: 'Name, mobile, and type are required' });
      return;
    }
    
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        businessName: data.businessName,
        gstNumber: data.gstNumber,
        type: data.type,
        address: data.address,
        status: data.status || 'ACTIVE',
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes
      }
    });
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Basic validation
    if (!data.name || !data.mobile || !data.type) {
      res.status(400).json({ error: 'Name, mobile, and type are required' });
      return;
    }
    
    const customer = await prisma.customer.update({
      where: { id: parseInt(id as string) },
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        businessName: data.businessName,
        gstNumber: data.gstNumber,
        type: data.type,
        address: data.address,
        status: data.status,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes
      }
    });
    
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
