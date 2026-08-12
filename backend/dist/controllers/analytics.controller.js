"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardAnalytics = void 0;
const prisma_1 = require("../prisma");
const getDashboardAnalytics = async (req, res) => {
    try {
        // Basic counts
        const totalCustomers = await prisma_1.prisma.customer.count();
        const totalProducts = await prisma_1.prisma.product.count();
        const totalChallans = await prisma_1.prisma.challan.count();
        // Financial Overview
        const invoices = await prisma_1.prisma.invoice.findMany({
            include: { payments: true }
        });
        let totalRevenue = 0;
        let outstandingAmount = 0;
        invoices.forEach(inv => {
            totalRevenue += inv.grandTotal;
            if (inv.status !== 'CANCELLED') {
                const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                outstandingAmount += (inv.grandTotal - paid);
            }
        });
        // Low stock alerts
        const lowStockProducts = await prisma_1.prisma.product.findMany({
            where: {
                currentStock: { lte: prisma_1.prisma.product.fields.minStockAlert } // If supported, otherwise raw query or fetch all and filter
            }
        }).catch(async () => {
            // Fallback if field reference fails in SQLite/Prisma version
            const allProds = await prisma_1.prisma.product.findMany();
            return allProds.filter(p => p.currentStock <= p.minStockAlert);
        });
        res.json({
            totalCustomers,
            totalProducts,
            totalChallans,
            financial: {
                totalRevenue,
                outstandingAmount
            },
            lowStockProducts: lowStockProducts.slice(0, 10) // Top 10 low stock
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
