import supplierService from '../services/supplierService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private/Admin
export const getSuppliers = asyncHandler(async (req, res) => {
    const result = await supplierService.getSuppliers(req.query);
    res.json(result);
});

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private/Admin
export const getSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.getSupplierById(req.params.id);
    res.json({ success: true, data: supplier });
});

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private/Admin
export const createSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.createSupplier(req.body, req.user._id);
    res.status(201).json({ success: true, data: supplier });
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
export const updateSupplier = asyncHandler(async (req, res) => {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body, req.user._id);
    res.json({ success: true, data: supplier });
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
export const deleteSupplier = asyncHandler(async (req, res) => {
    const result = await supplierService.deleteSupplier(req.params.id, req.user._id);
    res.json(result);
});

// @desc    Get supplier statistics
// @route   GET /api/suppliers/stats
// @access  Private/Admin
export const getSupplierStats = asyncHandler(async (req, res) => {
    const stats = await supplierService.getStats();
    res.json({ success: true, ...stats });
});
