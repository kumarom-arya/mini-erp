"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = exports.getPayments = void 0;
const prisma_1 = require("../prisma");
const getPayments = async (req, res) => {
    try {
        const payments = await prisma_1.prisma.payment.findMany({
            include: {
                invoice: {
                    include: {
                        customer: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(payments);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
exports.getPayments = getPayments;
const createPayment = async (req, res) => {
    try {
        const { invoiceId, amount, paymentMode, referenceNo } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const invoice = await prisma_1.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true }
        });
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        const paymentAmount = parseFloat(amount);
        const totalPaidSoFar = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const remainingBalance = invoice.grandTotal - totalPaidSoFar;
        if (paymentAmount <= 0) {
            res.status(400).json({ error: 'Payment amount must be greater than zero' });
            return;
        }
        // Rounding safety check for JS float math
        if (paymentAmount > Number(remainingBalance.toFixed(2))) {
            res.status(400).json({ error: `Payment amount cannot exceed the remaining balance of $${remainingBalance.toFixed(2)}` });
            return;
        }
        const payment = await prisma_1.prisma.payment.create({
            data: {
                invoiceId,
                amount: parseFloat(amount),
                paymentMode,
                referenceNo,
                createdById: userId,
            },
        });
        // Update invoice status based on total payments
        const allPayments = [...invoice.payments, payment];
        const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
        let newStatus = 'PARTIAL';
        if (totalPaid >= invoice.grandTotal) {
            newStatus = 'PAID';
        }
        await prisma_1.prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: newStatus }
        });
        res.status(201).json(payment);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create payment', details: error.message });
    }
};
exports.createPayment = createPayment;
