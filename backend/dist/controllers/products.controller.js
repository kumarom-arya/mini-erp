"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockMovements = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = require("../prisma");
const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        if (search && typeof search === 'string') {
            whereClause = {
                OR: [
                    { name: { contains: search } },
                    { sku: { contains: search } },
                    { category: { contains: search } }
                ]
            };
        }
        const products = await prisma_1.prisma.product.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        });
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const data = req.body;
        if (!data.name || !data.sku || !data.category || data.unitPrice === undefined) {
            res.status(400).json({ error: 'Name, SKU, category, and unit price are required' });
            return;
        }
        const existingSku = await prisma_1.prisma.product.findUnique({ where: { sku: data.sku } });
        if (existingSku) {
            res.status(400).json({ error: 'SKU already exists' });
            return;
        }
        const product = await prisma_1.prisma.product.create({
            data: {
                name: data.name,
                sku: data.sku,
                category: data.category,
                unitPrice: parseFloat(data.unitPrice),
                currentStock: data.currentStock ? parseInt(data.currentStock) : 0,
                minStockAlert: data.minStockAlert ? parseInt(data.minStockAlert) : 0,
                location: data.location
            }
        });
        // If initial stock > 0, log it
        if (product.currentStock > 0) {
            await prisma_1.prisma.stockMovement.create({
                data: {
                    productId: product.id,
                    quantity: product.currentStock,
                    movementType: 'IN',
                    reason: 'Initial stock opening',
                    createdById: req.user.id
                }
            });
        }
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (!data.name || !data.sku || !data.category || data.unitPrice === undefined) {
            res.status(400).json({ error: 'Name, SKU, category, and unit price are required' });
            return;
        }
        // Check if sku changed to an existing one
        const existingProduct = await prisma_1.prisma.product.findUnique({ where: { sku: data.sku } });
        if (existingProduct && existingProduct.id !== parseInt(id)) {
            res.status(400).json({ error: 'SKU already exists for another product' });
            return;
        }
        const originalProduct = await prisma_1.prisma.product.findUnique({ where: { id: parseInt(id) } });
        if (!originalProduct) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        const newStock = data.currentStock !== undefined ? parseInt(data.currentStock) : originalProduct.currentStock;
        const stockDiff = newStock - originalProduct.currentStock;
        const product = await prisma_1.prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name: data.name,
                sku: data.sku,
                category: data.category,
                unitPrice: parseFloat(data.unitPrice),
                currentStock: newStock,
                minStockAlert: data.minStockAlert ? parseInt(data.minStockAlert) : originalProduct.minStockAlert,
                location: data.location
            }
        });
        if (stockDiff !== 0) {
            await prisma_1.prisma.stockMovement.create({
                data: {
                    productId: product.id,
                    quantity: Math.abs(stockDiff),
                    movementType: stockDiff > 0 ? 'IN' : 'OUT',
                    reason: data.reason || 'Manual adjustment',
                    createdById: req.user.id
                }
            });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateProduct = updateProduct;
const getStockMovements = async (req, res) => {
    try {
        const movements = await prisma_1.prisma.stockMovement.findMany({
            include: {
                product: true,
                createdBy: {
                    select: { id: true, username: true }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 50 // pagination placeholder
        });
        res.json(movements);
    }
    catch (error) {
        console.error('Error fetching stock movements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getStockMovements = getStockMovements;
