"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoice = exports.getInvoiceById = exports.getInvoices = void 0;
const prisma_1 = require("../prisma");
const getInvoices = async (req, res) => {
    try {
        const invoices = await prisma_1.prisma.invoice.findMany({
            include: {
                customer: true,
                challan: true,
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
exports.getInvoices = getInvoices;
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await prisma_1.prisma.invoice.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
exports.getInvoiceById = getInvoiceById;
const createInvoice = async (req, res) => {
    try {
        const { challanId, customerId, taxAmount, discount } = req.body;
        // Assuming req.user is set by auth middleware
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // First fetch the challan and its items to calculate total
        const challan = await prisma_1.prisma.challan.findUnique({
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
        const count = await prisma_1.prisma.invoice.count();
        const invoiceNo = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const invoice = await prisma_1.prisma.invoice.create({
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
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create invoice', details: error.message });
    }
};
exports.createInvoice = createInvoice;
