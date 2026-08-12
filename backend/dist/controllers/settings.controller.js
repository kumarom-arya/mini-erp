"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = void 0;
const prisma_1 = require("../prisma");
const getSettings = async (req, res) => {
    try {
        const settings = await prisma_1.prisma.settings.findFirst();
        if (!settings) {
            res.json({});
            return;
        }
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const { companyName, address, phone, email, gstNumber, logoUrl } = req.body;
        let settings = await prisma_1.prisma.settings.findFirst();
        if (settings) {
            settings = await prisma_1.prisma.settings.update({
                where: { id: settings.id },
                data: { companyName, address, phone, email, gstNumber, logoUrl }
            });
        }
        else {
            settings = await prisma_1.prisma.settings.create({
                data: { companyName, address, phone, email, gstNumber, logoUrl }
            });
        }
        res.json(settings);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update settings', details: error.message });
    }
};
exports.updateSettings = updateSettings;
