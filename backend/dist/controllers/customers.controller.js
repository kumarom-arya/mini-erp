"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const prisma_1 = require("../prisma");
const getCustomers = async (req, res) => {
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
        const customers = await prisma_1.prisma.customer.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json(customers);
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await prisma_1.prisma.customer.findUnique({
            where: { id: parseInt(id) }
        });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(customer);
    }
    catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res) => {
    try {
        const data = req.body;
        // Basic validation
        if (!data.name || !data.mobile || !data.type) {
            res.status(400).json({ error: 'Name, mobile, and type are required' });
            return;
        }
        const customer = await prisma_1.prisma.customer.create({
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
    }
    catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        // Basic validation
        if (!data.name || !data.mobile || !data.type) {
            res.status(400).json({ error: 'Name, mobile, and type are required' });
            return;
        }
        const customer = await prisma_1.prisma.customer.update({
            where: { id: parseInt(id) },
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
    }
    catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateCustomer = updateCustomer;
