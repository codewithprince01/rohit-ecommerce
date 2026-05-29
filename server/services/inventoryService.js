import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import AuditLog from '../models/AuditLog.js';

class InventoryService {
    /**
     * Get inventory with filters
     */
    async getInventory(filters = {}) {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            lowStock, 
            outOfStock,
            category,
            sortBy = 'updatedAt',
            sortOrder = 'desc'
        } = filters;

        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            query.category = category;
        }

        if (lowStock === 'true') {
            query.$expr = { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] };
            query.stock = { $gt: 0 };
        }

        if (outOfStock === 'true') {
            query.stock = { $lte: 0 };
        }

        const total = await Product.countDocuments(query);

        const products = await Product.find(query)
            .populate('category', 'name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .lean();

        return {
            data: products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }

    /**
     * Adjust stock for a product
     */
    async adjustStock(productId, adjustment, user) {
        const { type, quantity, reason, batchNumber, expiryDate, note } = adjustment;
        const userId = user._id || user;
        
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const previousStock = product.stock || 0;
        let newStock;

        switch (type) {
            case 'add':
                newStock = previousStock + Number(quantity);
                break;
            case 'remove':
                newStock = Math.max(0, previousStock - Number(quantity));
                break;
            case 'set':
                newStock = Number(quantity);
                break;
            default:
                throw new Error('Invalid adjustment type');
        }

        // Update product stock
        product.stock = newStock;
        if (batchNumber) product.batchNumber = batchNumber;
        if (expiryDate) product.expiryDate = expiryDate;
        await product.save();

        // Create inventory log
        const inventoryLog = await Inventory.create({
            product: productId,
            type: type === 'add' ? 'IN' : type === 'remove' ? 'OUT' : 'ADJUSTMENT',
            quantity: Math.abs(newStock - previousStock),
            previousStock,
            newStock,
            reason: reason || 'Manual adjustment',
            batchNumber,
            expiryDate,
            note,
            performedBy: userId,
            reference: `ADJ-${Date.now()}`
        });

        // Audit log (using optional chaining in case AuditLog is not fully implemented)
        try {
            await AuditLog.log({
                user,
                action: 'update',
                resourceType: 'inventory',
                resourceId: productId,
                previousData: { stock: previousStock },
                newData: { stock: newStock },
                description: `Stock ${type}: ${quantity} units. Reason: ${reason || 'Manual adjustment'}`
            });
        } catch (auditError) {
            console.error('Audit log failed:', auditError.message);
        }

        return {
            product: await Product.findById(productId).populate('category', 'name'),
            inventoryLog,
            previousStock,
            newStock
        };
    }

    /**
     * Get low stock alerts
     */
    async getLowStockAlerts(threshold = 10) {
        const products = await Product.find({
            $expr: { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', threshold] }] },
            stock: { $gt: 0 }
        })
        .populate('category', 'name')
        .sort({ stock: 1 })
        .limit(50)
        .lean();

        return products;
    }

    /**
     * Get out of stock products
     */
    async getOutOfStock() {
        const products = await Product.find({ stock: { $lte: 0 } })
            .populate('category', 'name')
            .sort({ updatedAt: -1 })
            .lean();

        return products;
    }

    /**
     * Get expiring soon products
     */
    async getExpiringSoon(daysThreshold = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysThreshold);

        const products = await Product.find({
            expiryDate: { 
                $exists: true, 
                $ne: null,
                $lte: futureDate,
                $gte: new Date()
            }
        })
        .populate('category', 'name')
        .sort({ expiryDate: 1 })
        .lean();

        return products;
    }

    /**
     * Get inventory statistics
     */
    async getStats() {
        const [
            totalProducts,
            lowStockCount,
            outOfStockCount,
            expiringSoonCount
        ] = await Promise.all([
            Product.countDocuments({ isActive: true }),
            Product.countDocuments({
                $expr: { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 10] }] },
                stock: { $gt: 0 }
            }),
            Product.countDocuments({ stock: { $lte: 0 } }),
            Product.countDocuments({
                expiryDate: {
                    $exists: true,
                    $ne: null,
                    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    $gte: new Date()
                }
            })
        ]);

        return {
            totalProducts,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
            expiringSoon: expiringSoonCount
        };
    }

    /**
     * Bulk stock update
     */
    async bulkUpdate(updates, user) {
        const results = [];
        
        for (const update of updates) {
            try {
                const result = await this.adjustStock(update.productId, update, user);
                results.push({ success: true, ...result });
            } catch (error) {
                results.push({ success: false, productId: update.productId, error: error.message });
            }
        }

        return results;
    }

    /**
     * Get inventory history for a product
     */
    async getHistory(productId, options = {}) {
        const { page = 1, limit = 20 } = options;
        
        const logs = await Inventory.find({ product: productId })
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Inventory.countDocuments({ product: productId });

        return {
            data: logs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }
}

export default new InventoryService();
