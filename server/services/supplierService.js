import Supplier from '../models/Supplier.js';
import AuditLog from '../models/AuditLog.js';

class SupplierService {
    /**
     * Get suppliers with filters
     */
    async getSuppliers(filters = {}) {
        const { 
            page = 1, 
            limit = 10, 
            search,
            type,
            status,
            category
        } = filters;

        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (type) {
            query.type = type;
        }

        if (category) {
            query.categories = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { 'contact.primary.email': { $regex: search, $options: 'i' } },
                { 'business.gstNumber': { $regex: search, $options: 'i' } }
            ];
        }

        const suppliers = await Supplier.find(query)
            .populate('categories', 'name')
            .sort({ priority: -1, name: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Supplier.countDocuments(query);

        return {
            data: suppliers,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }

    /**
     * Get supplier by ID
     */
    async getSupplierById(id) {
        const supplier = await Supplier.findById(id)
            .populate('categories', 'name')
            .populate('products.product', 'name images')
            .lean();

        if (!supplier) {
            throw new Error('Supplier not found');
        }

        return supplier;
    }

    /**
     * Create new supplier
     */
    async createSupplier(data, userId) {
        // Generate code if not provided
        if (!data.code) {
            const count = await Supplier.countDocuments();
            data.code = `SUP${(count + 1).toString().padStart(4, '0')}`;
        }

        const supplier = await Supplier.create({
            ...data,
            createdBy: userId
        });

        await AuditLog.log({
            user: userId,
            action: 'create',
            resourceType: 'supplier',
            resourceId: supplier._id,
            newData: supplier.toObject(),
            description: `New supplier created: ${supplier.name}`
        });

        return supplier;
    }

    /**
     * Update supplier
     */
    async updateSupplier(id, data, userId) {
        const previousData = await Supplier.findById(id).lean();
        if (!previousData) {
            throw new Error('Supplier not found');
        }

        const supplier = await Supplier.findByIdAndUpdate(
            id,
            { ...data, updatedBy: userId },
            { new: true, runValidators: true }
        );

        await AuditLog.log({
            user: userId,
            action: 'update',
            resourceType: 'supplier',
            resourceId: id,
            previousData,
            newData: supplier.toObject(),
            description: `Supplier updated: ${supplier.name}`
        });

        return supplier;
    }

    /**
     * Delete supplier (soft delete or status change)
     */
    async deleteSupplier(id, userId) {
        const supplier = await Supplier.findById(id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        supplier.status = 'inactive';
        supplier.isActive = false;
        supplier.updatedBy = userId;
        await supplier.save();

        await AuditLog.log({
            user: userId,
            action: 'delete',
            resourceType: 'supplier',
            resourceId: id,
            description: `Supplier deactivated: ${supplier.name}`
        });

        return { success: true };
    }

    /**
     * Get supplier statistics
     */
    async getStats() {
        const [total, active, preferred, types] = await Promise.all([
            Supplier.countDocuments(),
            Supplier.countDocuments({ status: 'active' }),
            Supplier.countDocuments({ isPreferred: true }),
            Supplier.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ])
        ]);

        const typeStats = {};
        types.forEach(t => { typeStats[t._id] = t.count; });

        return {
            total,
            active,
            preferred,
            typeStats
        };
    }
}

export default new SupplierService();
