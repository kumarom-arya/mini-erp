"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveEditRequest = exports.getEditRequests = exports.createEditRequest = void 0;
const prisma_1 = require("../prisma");
const createEditRequest = async (req, res) => {
    try {
        const { challanId } = req.params;
        const { items } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!items || !items.length) {
            res.status(400).json({ error: 'Items are required for edit request' });
            return;
        }
        const challan = await prisma_1.prisma.challan.findUnique({
            where: { id: parseInt(challanId) }
        });
        if (!challan) {
            res.status(404).json({ error: 'Challan not found' });
            return;
        }
        if (challan.status !== 'CONFIRMED') {
            res.status(400).json({ error: 'Only CONFIRMED challans can be requested for edit' });
            return;
        }
        // Check if there's already a pending request
        const existingRequest = await prisma_1.prisma.challanEditRequest.findFirst({
            where: { challanId: parseInt(challanId), status: 'PENDING' }
        });
        if (existingRequest) {
            res.status(400).json({ error: 'A pending edit request already exists for this challan' });
            return;
        }
        const editRequest = await prisma_1.prisma.challanEditRequest.create({
            data: {
                challanId: parseInt(challanId),
                proposedData: JSON.stringify(items),
                requestedById: userId
            }
        });
        res.status(201).json(editRequest);
    }
    catch (error) {
        console.error('Error creating edit request:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
exports.createEditRequest = createEditRequest;
const getEditRequests = async (req, res) => {
    try {
        const requests = await prisma_1.prisma.challanEditRequest.findMany({
            include: {
                challan: {
                    include: { customer: true, items: true }
                },
                requestedBy: { select: { id: true, username: true } },
                resolvedBy: { select: { id: true, username: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        console.error('Error fetching edit requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getEditRequests = getEditRequests;
const resolveEditRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'APPROVE' or 'REJECT'
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (action !== 'APPROVE' && action !== 'REJECT') {
            res.status(400).json({ error: 'Invalid action' });
            return;
        }
        const request = await prisma_1.prisma.challanEditRequest.findUnique({
            where: { id: parseInt(id) },
            include: { challan: { include: { items: true } } }
        });
        if (!request) {
            res.status(404).json({ error: 'Edit request not found' });
            return;
        }
        if (request.status !== 'PENDING') {
            res.status(400).json({ error: 'Edit request has already been resolved' });
            return;
        }
        if (action === 'REJECT') {
            const updatedRequest = await prisma_1.prisma.challanEditRequest.update({
                where: { id: request.id },
                data: {
                    status: 'REJECTED',
                    resolvedById: userId,
                    updatedAt: new Date()
                }
            });
            res.json(updatedRequest);
            return;
        }
        // Process Approval
        const proposedItems = JSON.parse(request.proposedData);
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Revert stock for existing items
            for (const item of request.challan.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { currentStock: { increment: item.quantity } }
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: item.quantity,
                        movementType: 'IN',
                        reason: `Challan ${request.challan.challanNo} Edit Reversal`,
                        createdById: userId
                    }
                });
            }
            // 2. Delete old items
            await tx.challanItem.deleteMany({
                where: { challanId: request.challanId }
            });
            // 3. Process new items and deduct stock
            let totalQty = 0;
            const challanItemsData = [];
            for (const item of proposedItems) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product)
                    throw new Error(`Product ${item.productId} not found`);
                if (product.currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                }
                totalQty += item.quantity;
                challanItemsData.push({
                    productId: product.id,
                    quantity: item.quantity,
                    productName: product.name,
                    productSku: product.sku,
                    unitPrice: product.unitPrice
                });
                await tx.product.update({
                    where: { id: item.productId },
                    data: { currentStock: { decrement: item.quantity } }
                });
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        quantity: item.quantity,
                        movementType: 'OUT',
                        reason: `Challan ${request.challan.challanNo} Edit Applied`,
                        createdById: userId
                    }
                });
            }
            // 4. Create new items and update totalQty
            await tx.challan.update({
                where: { id: request.challanId },
                data: {
                    totalQty,
                    items: {
                        create: challanItemsData
                    }
                }
            });
            // 5. Update request status
            const updatedRequest = await tx.challanEditRequest.update({
                where: { id: request.id },
                data: {
                    status: 'APPROVED',
                    resolvedById: userId,
                    updatedAt: new Date()
                }
            });
            return updatedRequest;
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error resolving edit request:', error);
        res.status(400).json({ error: error.message || 'Internal server error' });
    }
};
exports.resolveEditRequest = resolveEditRequest;
